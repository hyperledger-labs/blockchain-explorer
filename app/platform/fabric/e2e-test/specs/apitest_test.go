package apitest

import (
	"os"
	"os/exec"
	"strconv"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/hyperledger/fabric-test/tools/operator/networkclient"
)

var (
	channelMonitored    string
	org1CurrentBlockNum int
	org2CurrentBlockNum int
	action              string
	networkSpecPath     string
	inputSpecPath       string
	token               string
	channelGenesisHash  string
	blockHeight         int
)

const (
	relativePahtToRoot = "../../../../.."
	explorerURL        = "http://localhost:8080"
	waitSyncInterval   = 7
)

func basicCheck(loginId string) {

	It("get network list", func() {

		resp := restGet("/auth/networklist", &NetworklistInfo{})

		result := resp.Result().(*NetworklistInfo)
		nameList := []string{}
		idList := []string{}
		for _, val := range result.NetworkList {
			nameList = append(nameList, val.Name)
			idList = append(idList, val.Id)
		}
		Expect(nameList).Should(HaveLen(1))
		Expect(nameList).Should(ContainElements([]string{"org1-network"}))
		Expect(idList).Should(HaveLen(1))
		Expect(idList).Should(ContainElements([]string{"org1-network"}))
	})

	It("login to org1-network", func() {

		resp := restPost("/auth/login", map[string]interface{}{"user": loginId, "password": "exploreradminpw", "network": "org1-network"}, &LoginResponse{})
		result := resp.Result().(*LoginResponse)
		token = result.Token

		Expect(resp.StatusCode()).Should(Equal(200))
		Expect(result.Success).Should(Equal(true))
		Expect(result.User.Message).Should(Equal("logged in"))
		Expect(result.User.Name).Should(Equal(loginId))
	})

	It("fail to login with invalid credential", func() {

		resp := restPost("/auth/login", map[string]interface{}{"user": loginId, "password": "invalid", "network": "org1-network"}, &LoginResponse{})
		result := resp.Result().(*LoginResponse)

		Expect(resp.StatusCode()).Should(Equal(400))
		Expect(result.Success).Should(Equal(false))
	})

	It("get channels", func() {
		resp := restGetWithToken("/api/channels", &ChannelsResponse{}, token)
		result := resp.Result().(*ChannelsResponse)
		Expect(result.Channels).Should(ContainElements([]string{"org1channel", "commonchannel"}))
		Expect(len(result.Channels)).Should(Equal(2))
	})

	It("get channels info", func() {
		resp := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
		result := resp.Result().(*ChannelsInfoResp)
		chList := result.getChannelList()
		channelGenesisHash = result.getGenesisHash("commonchannel")
		blockHeight = result.getBlockHeight("commonchannel") - 1
		Expect(chList).Should(ContainElements([]string{"commonchannel", "org1channel"}))
		Expect(len(chList)).Should(Equal(2))
	})

	It("get block info", func() {
		resp := restGetWithToken("/api/block/"+channelGenesisHash+"/"+strconv.Itoa(blockHeight), &BlockResp{}, token)
		result := resp.Result().(*BlockResp)
		Expect(result.Status).Should(Equal(200))
	})

	It("get status of peers within commonchannel", func() {
		resp := restGetWithToken("/api/peersStatus/"+"commonchannel", &PeersStatusResp{}, token)
		result := resp.Result().(*PeersStatusResp)
		Expect(result.Status).Should(Equal(200))
	})

	It("get block activity", func() {
		resp := restGetWithToken("/api/blockActivity/"+channelGenesisHash, &BlockActivityResp{}, token)
		result := resp.Result().(*BlockActivityResp)
		Expect(result.Status).Should(Equal(200))
		Expect(result.Row[0].Channelname).Should(Equal("commonchannel"))
	})
}

var _ = Describe("REST API Test Suite - Single profile", func() {

	Describe("Running REST API Test Suite in fabric-test", func() {

		It("launch explorer", func() {
			cwd, _ := os.Getwd()
			os.Chdir(relativePahtToRoot)
			// os.RemoveAll("./logs")
			os.Chdir(cwd)

			cmd := exec.Command("bash", "./runexplorer.sh", "-m", "single")
			err := cmd.Start()
			Expect(err).NotTo(HaveOccurred())
			Eventually(isExplorerReady, 60, 5).Should(Equal(true))

			time.Sleep(waitSyncInterval * time.Second)
		})

		basicCheck("org1exploreradmin")

		It("register user", func() {
			resp := restPostWithToken("/api/register", map[string]interface{}{"user": "test", "password": "test", "network": "org1-network"}, &RegisterResp{}, token)
			resultRegister := resp.Result().(*RegisterResp)
			Expect(resultRegister.Status).Should(Equal(200))
		})

		It("list user", func() {
			resp := restGetWithToken("/api/userlist", &UserListResp{}, token)
			resultRegister := resp.Result().(*UserListResp)
			Expect(resultRegister.Status).Should(Equal(200))
		})

		It("unregister user", func() {
			resp := restPostWithToken("/api/unregister", map[string]interface{}{"user": "test", "network": "org1-network"}, &RegisterResp{}, token)
			resultRegister := resp.Result().(*RegisterResp)
			Expect(resultRegister.Status).Should(Equal(200))
		})

		It("register user", func() {
			resp := restPostWithToken("/api/register", map[string]interface{}{"user": "test", "password": "test", "network": "org1-network"}, &RegisterResp{}, token)
			resultRegister := resp.Result().(*RegisterResp)
			Expect(resultRegister.Status).Should(Equal(200))
		})

		It("login with newly registered user", func() {
			resp := restPost("/auth/login", map[string]interface{}{"user": "test", "password": "test", "network": "org1-network"}, &LoginResponse{})
			resultLogin := resp.Result().(*LoginResponse)

			Expect(resultLogin.User.Message).Should(Equal("logged in"))
			Expect(resultLogin.User.Name).Should(Equal("test"))
		})

		It("fail to register duplicate user", func() {
			resp := restPostWithToken("/api/register", map[string]interface{}{"user": "test", "password": "test", "network": "org1-network"}, &RegisterResp{}, token)
			resultRegister := resp.Result().(*RegisterResp)
			Expect(resultRegister.Status).Should(Equal(400))
			Expect(resultRegister.Message).Should(Equal("Error: already exists"))
		})

		It("stop explorer", func() {
			_, err := networkclient.ExecuteCommand("bash", []string{"./stopexplorer.sh"}, true)
			Expect(err).NotTo(HaveOccurred())
		})

		It("launch explorer - pem format", func() {
			cwd, _ := os.Getwd()
			os.Chdir(relativePahtToRoot)
			os.RemoveAll("./logs")
			os.Chdir(cwd)

			cmd := exec.Command("bash", "./runexplorer.sh", "-m", "single-pem")
			err := cmd.Start()
			Expect(err).NotTo(HaveOccurred())
			Eventually(isExplorerReady, 60, 5).Should(Equal(true))

			time.Sleep(waitSyncInterval * time.Second)
		})

		basicCheck("exploreradmin2")

		It("stop explorer, but persist data and wallet", func() {
			_, err := networkclient.ExecuteCommand("bash", []string{"./stopexplorer.sh", "-k"}, true)
			Expect(err).NotTo(HaveOccurred())
		})

		It("restart explorer", func() {
			cwd, _ := os.Getwd()
			os.Chdir(relativePahtToRoot)
			os.RemoveAll("./logs")
			os.Chdir(cwd)

			cmd := exec.Command("bash", "./runexplorer.sh", "-m", "single-pem", "-k")
			err := cmd.Start()
			Expect(err).NotTo(HaveOccurred())
			Eventually(isExplorerReady, 60, 5).Should(Equal(true))

			time.Sleep(waitSyncInterval * time.Second)
		})

		basicCheck("exploreradmin2")

		It("stop explorer", func() {
			_, err := networkclient.ExecuteCommand("bash", []string{"./stopexplorer.sh"}, true)
			Expect(err).NotTo(HaveOccurred())
		})

		It("launch explorer - disable authentication", func() {
			cwd, _ := os.Getwd()
			os.Chdir(relativePahtToRoot)
			os.RemoveAll("./logs")
			os.Chdir(cwd)

			cmd := exec.Command("bash", "./runexplorer.sh", "-m", "single-disable-auth")
			err := cmd.Start()
			Expect(err).NotTo(HaveOccurred())
			Eventually(isExplorerReady, 60, 5).Should(Equal(true))

			time.Sleep(waitSyncInterval * time.Second)
		})

		It("succeed to login with invalid credential", func() {

			resp := restPost("/auth/login", map[string]interface{}{"user": "invalid", "password": "invalid", "network": "org1-network"}, &LoginResponse{})
			result := resp.Result().(*LoginResponse)

			Expect(resp.StatusCode()).Should(Equal(200))
			Expect(result.Success).Should(Equal(true))
		})

		It("stop explorer", func() {
			_, err := networkclient.ExecuteCommand("bash", []string{"./stopexplorer.sh"}, true)
			Expect(err).NotTo(HaveOccurred())
		})

	})
})
