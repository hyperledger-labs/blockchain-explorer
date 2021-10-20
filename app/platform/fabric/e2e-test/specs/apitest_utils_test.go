package apitest

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"

	. "github.com/onsi/gomega"

	"github.com/go-resty/resty/v2"
	"github.com/hyperledger/fabric-test/tools/operator/launcher"
	"github.com/hyperledger/fabric-test/tools/operator/networkclient"
)

func findKeywordInConsoleLog(keyword string) bool {
	cwd, _ := os.Getwd()
	os.Chdir(relativePahtToRoot)
	defer os.Chdir(cwd)
	arg := fmt.Sprintf(`docker logs explorer.mynetwork.com 2>&1 | grep "%s" | wc -l`, keyword)
	cmd := exec.Command("sh", "-c", arg)
	result, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}
	ret, _ := strconv.Atoi(strings.TrimSuffix(string(result), "\n"))
	return ret != 0
}

func CheckHowManyEventHubRegistered() bool {
	key := fmt.Sprintf(`Successfully created channel event hub for \[%s\]`, channelMonitored)
	ret := findKeywordInConsoleLog(key)
	return ret
}

func CheckIfSwitchedToNewOrderer() bool {
	key := "Succeeded to switch default orderer to"
	ret := findKeywordInConsoleLog(key)
	return ret
}

func StopNode(nodeName string) {
	cmd := exec.Command("docker", "rm", "-f", nodeName)
	_, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}
}

func restGet(path string, data interface{}) *resty.Response {
	return restGetWithToken(path, data, "")
}

func restGetWithToken(path string, data interface{}, token string) *resty.Response {
	client := resty.New()
	if len(token) != 0 {
		client.SetAuthToken(token)
	}

	resp, err := client.R().
		EnableTrace().
		SetResult(data).
		Get(explorerURL + path)

	Expect(err).ShouldNot(HaveOccurred())
	return resp
}

func compareChannelsInfoBlockCount(before *ChannelsInfoResp, after *ChannelsInfoResp, channel string, expectDiff int) {
	beforeData := before.getChannelData(channel)
	Expect(beforeData).ShouldNot(Equal(nil))
	afterData := after.getChannelData(channel)
	Expect(afterData).ShouldNot(Equal(nil))
	diff := afterData.Blocks - beforeData.Blocks
	Expect(diff).Should(Equal(expectDiff))
}

func compareChannelsInfoTxCount(before *ChannelsInfoResp, after *ChannelsInfoResp, channel string, expectDiff int) {
	beforeData := before.getChannelData(channel)
	Expect(beforeData).ShouldNot(Equal(nil))
	afterData := after.getChannelData(channel)
	Expect(afterData).ShouldNot(Equal(nil))
	diff := afterData.Transactions - beforeData.Transactions
	Expect(diff).Should(Equal(expectDiff))
}

func isExplorerReady() bool {
	key := "SyncServices.synchNetworkConfigToDB client"
	ret := findKeywordInConsoleLog(key)
	if ret {
		log.Println("Synced. Get ready to start")
		return true
	}
	return false
}

func restLogin(user string, password string, network string) string {
	resp := restPost("/auth/login", map[string]interface{}{"user": user, "password": password, "network": network}, &LoginResponse{})
	resultLogin := resp.Result().(*LoginResponse)
	token := resultLogin.Token
	Expect(resultLogin.User.Message).Should(Equal("logged in"))
	return token
}

func restPost(path string, body interface{}, data interface{}) *resty.Response {
	return restPostWithToken(path, body, data, "")
}

func restPostWithToken(path string, body interface{}, data interface{}, token string) *resty.Response {
	client := resty.New()
	if len(token) != 0 {
		client.SetAuthToken(token)
	}
	resp, err := client.R().
		EnableTrace().
		SetHeader("Content-Type", "application/json").
		SetBody(body).
		SetResult(data).
		Post(explorerURL + path)

	Expect(err).ShouldNot(HaveOccurred())
	return resp
}

func cleanupContainers(networkSpec string) {
	err := launcher.Launcher("down", "docker", "", networkSpec)
	Expect(err).NotTo(HaveOccurred())

	dockerList := []string{"ps", "-aq", "-f", "status=exited"}
	containerList, _ := networkclient.ExecuteCommand("docker", dockerList, false)
	if containerList != "" {
		list := strings.Split(containerList, "\n")
		containerArgs := []string{"rm", "-f"}
		containerArgs = append(containerArgs, list...)
		networkclient.ExecuteCommand("docker", containerArgs, true)
	}
	ccimagesList := []string{"images", "-q", "--filter=reference=dev*"}
	images, _ := networkclient.ExecuteCommand("docker", ccimagesList, false)
	if images != "" {
		list := strings.Split(images, "\n")
		imageArgs := []string{"rmi", "-f"}
		imageArgs = append(imageArgs, list...)
		networkclient.ExecuteCommand("docker", imageArgs, true)
	}
}
