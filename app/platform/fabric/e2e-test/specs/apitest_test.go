package apitest

import (
	"fmt"
	"log"
	"os/exec"
	"strconv"
	"strings"

	"github.com/go-resty/resty/v2"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/hyperledger/fabric-test/tools/operator/networkclient"
	"github.com/hyperledger/fabric-test/tools/operator/testclient"
)

type UserData struct {
	Message string `json:"message"`
	Name    string `json:"name"`
}

type LoginResponse struct {
	Status  int      `json:"status"`
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Token   string   `json:"token"`
	User    UserData `json:"user"`
}

type RegisterResp struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

type ChannelData struct {
	ID                 int    `json:"id"`
	Channelname        string `json:"channelname"`
	Blocks             int    `json:"blocks"`
	ChannelGenesisHash string `json:"channel_genesis_hash"`
	Transactions       int    `json:"transactions"`
	Createdat          string `json:"createdat"`
	ChannelHash        string `json:"channel_hash"`
}

type ChannelsInfoResp struct {
	Status   int           `json:"status"`
	Channels []ChannelData `json:"channels"`
}

type ChannelsResponse struct {
	Status   int      `json:"status"`
	Channels []string `json:"channels"`
}

var (
	channelMonitored string
)

func CheckHowManyEventHubRegistered() int {
	arg := fmt.Sprintf(`docker logs explorer.mynetwork.com | grep "Successfully created channel event hub for \[%s\]" | wc -l`, channelMonitored)
	cmd := exec.Command("sh", "-c", arg)
	result, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}
	ret, _ := strconv.Atoi(strings.TrimSuffix(string(result), "\n"))
	return ret
}

func CheckIfSwitchedToNewOrderer() int {
	arg := `docker logs explorer.mynetwork.com | grep "Succeeded to switch default orderer to" | wc -l`
	cmd := exec.Command("sh", "-c", arg)
	result, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}
	ret, _ := strconv.Atoi(strings.TrimSuffix(string(result), "\n"))
	return ret
}

func StopNode(nodeName string) {
	cmd := exec.Command("docker", "rm", "-f", nodeName)
	_, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}
}

var _ = Describe("REST API Test Suite", func() {

	Describe("Running REST API Test Suite in fabric-test", func() {
		var (
			action             string
			inputSpecPath      string
			token              string
			channelGenesisHash string
			blockHeight        int
		)
		It("starting fabric network", func() {
			out, err := exec.Command("pwd").Output()
			if err != nil {
				log.Fatal(err)
			}
			fmt.Printf("The date is %s\n", out)
			inputSpecPath = "apitest-input-singleprofile.yml"

			By("0) Generating channel artifacts")
			_, err = networkclient.ExecuteCommand("./genchannelartifacts.sh", []string{}, true)
			Expect(err).NotTo(HaveOccurred())

			By("1) Creating channel")
			action = "create"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			By("2) Joining Peers to channel")
			action = "join"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			By("3) Updating channel with anchor peers")
			action = "anchorpeer"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			By("4) Installing Chaincode on Peers")
			action = "install"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			By("5) Instantiating Chaincode")
			action = "instantiate"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			By("6) Sending Queries")
			action = "query"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			By("7) Sending Invokes")
			action = "invoke"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

		})

		It("launch explorer", func() {
			_, err := networkclient.ExecuteCommand("./runexplorer.sh", []string{"single"}, true)
			Expect(err).NotTo(HaveOccurred())
		})

		It("get network list", func() {
			type NetworklistInfo struct {
				NetworkList [][]interface{} `json:"networkList"`
			}

			// Create a Resty Client
			client := resty.New()

			resp, err := client.R().
				EnableTrace().
				SetResult(&NetworklistInfo{}).
				Get("http://localhost:8090/auth/networklist")

			Expect(err).ShouldNot(HaveOccurred())

			result := resp.Result().(*NetworklistInfo)
			list := []string{}
			for _, val := range result.NetworkList {
				list = append(list, val[0].(string))
			}
			Expect(list).Should(HaveLen(1))
			Expect(list).Should(ContainElements([]string{"org1-network"}))

		})

		It("login to org1-network", func() {

			client := resty.New()

			resp, err := client.R().
				EnableTrace().
				SetHeader("Content-Type", "application/json").
				SetBody(map[string]interface{}{"user": "admin", "password": "adminpw", "network": "org1-network"}).
				SetResult(&LoginResponse{}).
				Post("http://localhost:8090/auth/login")

			Expect(err).ShouldNot(HaveOccurred())

			result := resp.Result().(*LoginResponse)
			token = result.Token

			Expect(result.User.Message).Should(Equal("logged in"))
			Expect(result.User.Name).Should(Equal("admin"))
		})

		It("get channels", func() {

			client := resty.New()
			client.SetAuthToken(token)

			resp, err := client.R().
				EnableTrace().
				SetResult(&ChannelsResponse{}).
				Get("http://localhost:8090/api/channels")

			Expect(err).ShouldNot(HaveOccurred())

			result := resp.Result().(*ChannelsResponse)

			Expect(result.Channels).Should(ContainElements([]string{"org1channel", "commonchannel"}))

		})

		It("get channels info", func() {

			client := resty.New()
			client.SetAuthToken(token)

			resp, err := client.R().
				EnableTrace().
				SetResult(&ChannelsInfoResp{}).
				Get("http://localhost:8090/api/channels/info")

			Expect(err).ShouldNot(HaveOccurred())

			result := resp.Result().(*ChannelsInfoResp)
			chList := []string{}
			for _, ch := range result.Channels {
				chList = append(chList, ch.Channelname)
				if ch.Channelname == "commonchannel" {
					channelGenesisHash = ch.ChannelGenesisHash
					blockHeight = ch.Blocks - 1
				}
			}
			// Expect(result.Channels[0].Channelname).Should(Equal("commonchannel"))
			Expect(chList).Should(ContainElements([]string{"commonchannel", "org1channel"}))

		})

		It("get block info", func() {
			type BlockResp struct {
				Status       int           `json:"status"`
				Number       string        `json:"number"`
				PreviousHash string        `json:"previous_hash"`
				DataHash     string        `json:"data_hash"`
				Transactions []interface{} `json:"transactions"`
			}

			client := resty.New()
			client.SetAuthToken(token)

			resp, err := client.R().
				EnableTrace().
				SetResult(&BlockResp{}).
				Get("http://localhost:8090/api/block/" + channelGenesisHash + "/" + strconv.Itoa(blockHeight))

			Expect(err).ShouldNot(HaveOccurred())
			result := resp.Result().(*BlockResp)
			Expect(result.Status).Should(Equal(200))

		})

		It("get status of peers within commonchannel", func() {
			type PeersStatusResp struct {
				Status int           `json:"status"`
				Peers  []interface{} `json:"peers"`
			}

			client := resty.New()
			client.SetAuthToken(token)

			resp, err := client.R().
				EnableTrace().
				SetResult(&PeersStatusResp{}).
				Get("http://localhost:8090/api/peersStatus/" + "commonchannel")

			Expect(err).ShouldNot(HaveOccurred())
			result := resp.Result().(*PeersStatusResp)
			Expect(result.Status).Should(Equal(200))
		})

		It("get block activity", func() {
			type BlockData struct {
				Blocknum    int      `json:"blocknum"`
				Txcount     int      `json:"txcount"`
				Datahash    string   `json:"datahash"`
				Blockhash   string   `json:"blockhash"`
				Prehash     string   `json:"prehash"`
				Createdt    string   `json:"createdt"`
				Txhash      []string `json:"txhash"`
				Channelname string   `json:"channelname"`
			}

			type BlockActivityResp struct {
				Status int         `json:"status"`
				Row    []BlockData `json:"row"`
			}

			client := resty.New()
			client.SetAuthToken(token)

			resp, err := client.R().
				EnableTrace().
				SetResult(&BlockActivityResp{}).
				Get("http://localhost:8090/api/blockActivity/" + channelGenesisHash)

			Expect(err).ShouldNot(HaveOccurred())
			result := resp.Result().(*BlockActivityResp)
			Expect(result.Status).Should(Equal(200))
			Expect(result.Row[0].Channelname).Should(Equal("commonchannel"))
		})

		It("register user", func() {
			type RegisterResp struct {
				Status  int    `json:"status"`
				Message string `json:"message"`
			}

			client := resty.New()
			client.SetAuthToken(token)
			resp, err := client.R().
				EnableTrace().
				SetHeader("Content-Type", "application/json").
				SetBody(map[string]interface{}{"user": "test", "password": "test", "affiliation": "department2", "role": "admin"}).
				SetResult(&RegisterResp{}).
				Post("http://localhost:8090/api/register")

			Expect(err).ShouldNot(HaveOccurred())
			resultRegister := resp.Result().(*RegisterResp)
			Expect(resultRegister.Status).Should(Equal(200))
		})

		It("login with newly registered user", func() {

			client := resty.New()
			client.SetAuthToken(token)

			resp, err := client.R().
				EnableTrace().
				SetHeader("Content-Type", "application/json").
				SetBody(map[string]interface{}{"user": "test", "password": "test", "network": "org1-network"}).
				SetResult(&LoginResponse{}).
				Post("http://localhost:8090/auth/login")

			Expect(err).ShouldNot(HaveOccurred())

			resultLogin := resp.Result().(*LoginResponse)

			Expect(resultLogin.User.Message).Should(Equal("logged in"))
			Expect(resultLogin.User.Name).Should(Equal("test"))
		})

		It("fail to register duplicate user", func() {

			client := resty.New()
			client.SetAuthToken(token)
			resp, err := client.R().
				EnableTrace().
				SetHeader("Content-Type", "application/json").
				SetBody(map[string]interface{}{"user": "test", "password": "test", "affiliation": "department2", "role": "admin"}).
				SetResult(&RegisterResp{}).
				Post("http://localhost:8090/api/register")

			Expect(err).ShouldNot(HaveOccurred())
			resultRegister := resp.Result().(*RegisterResp)
			Expect(resultRegister.Status).Should(Equal(400))
			Expect(resultRegister.Message).Should(Equal("Error: already exists"))
		})

		Describe("Bugfix check:", func() {

			It("Add new channel to org1 and explorer should detect it", func() {
				inputSpecPath = "apitest-input-singleprofile_addnewch.yml"

				By("1) Creating channel")
				action := "create"
				err := testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				By("2) Joining Peers to channel")
				action = "join"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				By("3) Updating channel with anchor peers")
				action = "anchorpeer"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				By("4) Instantiating Chaincode")
				action = "instantiate"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				By("5) Sending Queries")
				action = "query"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				By("6) Sending Invokes")
				action = "invoke"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				By("7) Retrieving channels again")
				client := resty.New()
				client.SetAuthToken(token)

			})

			It("Should include the newly added channel when retrieving channels again", func() {

				client := resty.New()
				client.SetAuthToken(token)

				resp, err := client.R().
					EnableTrace().
					SetResult(&ChannelsResponse{}).
					Get("http://localhost:8090/api/channels")
				Expect(err).ShouldNot(HaveOccurred())

				result := resp.Result().(*ChannelsResponse)
				Expect(result.Channels).Should(ContainElements([]string{"org1channel", "commonchannel", "channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422"}))

			})

			It("Should create a new event hub for the newly added channel within 60s", func() {
				channelMonitored = "channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422"
				Eventually(CheckHowManyEventHubRegistered, 70, 5).Should(Equal(1))
				channelMonitored = "commonchannel"
				Expect(CheckHowManyEventHubRegistered()).Should(Equal(1))
				channelMonitored = "org1channel"
				Expect(CheckHowManyEventHubRegistered()).Should(Equal(1))
			})

			It("Should keep running fine even after removing one of orderer peers", func() {
				StopNode("orderer0-ordererorg1")
				Eventually(CheckIfSwitchedToNewOrderer, 60, 5).Should(Equal(1))
				StopNode("orderer1-ordererorg1")
				Eventually(CheckIfSwitchedToNewOrderer, 60, 5).Should(Equal(2))
			})

		})

		It("stop explorer", func() {
			_, err := networkclient.ExecuteCommand("./stopexplorer.sh", []string{}, true)
			Expect(err).NotTo(HaveOccurred())
		})

	})
})
