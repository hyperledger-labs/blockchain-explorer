package apitest

import (
	"fmt"
	"log"
	"os/exec"
	"strconv"

	"github.com/go-resty/resty/v2"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/hyperledger/fabric-test/tools/operator/networkclient"
	"github.com/hyperledger/fabric-test/tools/operator/testclient"
)

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

			// By("4) Installing Chaincode on Peers")
			// action = "install"
			// err = testclient.Testclient(action, inputSpecPath)
			// Expect(err).NotTo(HaveOccurred())

			// By("5) Instantiating Chaincode")
			// action = "instantiate"
			// err = testclient.Testclient(action, inputSpecPath)
			// Expect(err).NotTo(HaveOccurred())

			// By("6) Sending Queries")
			// action = "query"
			// err = testclient.Testclient(action, inputSpecPath)
			// Expect(err).NotTo(HaveOccurred())

			// By("7) Sending Invokes")
			// action = "invoke"
			// err = testclient.Testclient(action, inputSpecPath)
			// Expect(err).NotTo(HaveOccurred())

			// By("8) Upgrading Chaincode")
			// action = "upgrade"
			// err = testclient.Testclient(action, inputSpecPath)
			// Expect(err).NotTo(HaveOccurred())

			// By("9) Sending Queries")
			// action = "query"
			// testclient.Testclient(action, inputSpecPath)
			// Expect(err).NotTo(HaveOccurred())
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

			client := resty.New()

			resp, err := client.R().
				EnableTrace().
				SetHeader("Content-Type", "application/json").
				SetBody(map[string]interface{}{"user": "admin", "password": "adminpw", "network": "org1-network"}).
				SetResult(&LoginResponse{}).
				Post("http://localhost:8090/auth/login")

			Expect(err).ShouldNot(HaveOccurred())

			result := resp.Result().(*LoginResponse)

			Expect(result.User.Message).Should(Equal("logged in"))
			Expect(result.User.Name).Should(Equal("admin"))
			token = result.Token
			fmt.Println(token)

		})

		It("get channels", func() {
			type ChannelsResponse struct {
				Status   int      `json:"status"`
				Channels []string `json:"channels"`
			}

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
				Status       int         `json:"status"`
				Number       string      `json:"number"`
				PreviousHash string      `json:"previous_hash"`
				DataHash     string      `json:"data_hash"`
				Transactions interface{} `json:"transactions"`
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

		It("stop explorer", func() {
			By("9) Stop Explorer ")
			_, err := networkclient.ExecuteCommand("./stopexplorer.sh", []string{}, true)
			Expect(err).NotTo(HaveOccurred())
		})

	})
})
