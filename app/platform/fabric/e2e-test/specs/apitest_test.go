package apitest

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/hyperledger/fabric-test/tools/operator/launcher"
	"github.com/hyperledger/fabric-test/tools/operator/networkclient"
	"github.com/hyperledger/fabric-test/tools/operator/testclient"
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
		list := []string{}
		for _, val := range result.NetworkList {
			list = append(list, val.Name)
		}
		Expect(list).Should(HaveLen(1))
		Expect(list).Should(ContainElements([]string{"org1-network"}))
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

		It("Starting fabric network", func() {
			var fabricVer = os.Getenv("FABRIC_VERSION")
			if fabricVer == "1" {
				networkSpecPath = "apitest-network-spec.yml"
			} else {
				networkSpecPath = "apitest-network-spec-v2.yml"
			}
			fmt.Printf("Network spec is %s\n", networkSpecPath)
			err := launcher.Launcher("up", "docker", "", networkSpecPath)
			Expect(err).NotTo(HaveOccurred())
		})

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

			time.Sleep(waitSyncInterval * time.Second)
		})

		It("launch explorer", func() {
			cwd, _ := os.Getwd()
			os.Chdir(relativePahtToRoot)
			os.RemoveAll("./logs")
			os.Chdir(cwd)

			cmd := exec.Command("bash", "./runexplorer.sh", "-m", "single")
			err := cmd.Start()
			Expect(err).NotTo(HaveOccurred())
			Eventually(isExplorerReady, 60, 5).Should(Equal(true))

			time.Sleep(waitSyncInterval * time.Second)
		})

		basicCheck("exploreradmin")

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

				time.Sleep(waitSyncInterval * time.Second)
			})

			It("Should include the newly added channel when retrieving channels again", func() {
				resp := restGetWithToken("/api/channels", &ChannelsResponse{}, token)
				result := resp.Result().(*ChannelsResponse)
				Expect(result.Channels).Should(ContainElements([]string{"org1channel", "commonchannel", "channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422"}))
			})

			It("Should create a new event hub for the newly added channel within 60s", func() {
				channelMonitored = "channel2422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422422"
				Eventually(CheckHowManyEventHubRegistered, 70, 5).Should(Equal(true))
				channelMonitored = "commonchannel"
				Expect(CheckHowManyEventHubRegistered()).Should(Equal(true))
				channelMonitored = "org1channel"
				Expect(CheckHowManyEventHubRegistered()).Should(Equal(true))
			})

			It("should be able to validate hashchain correctly", func() {
				_, err := exec.Command("bash", "./validate_hash.sh", "-c", "commonchannel").Output()
				Expect(err).NotTo(HaveOccurred())

				_, err = exec.Command("bash", "./validate_hash.sh", "-c", "org1channel").Output()
				Expect(err).NotTo(HaveOccurred())
			})
		})

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

		It("Shutdown network", func() {
			err := launcher.Launcher("down", "docker", "", networkSpecPath)
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
		})

	})
})

var _ = Describe("REST API Test Suite - Multiple profile", func() {

	Describe("Running REST API Test Suite in fabric-test", func() {

		It("Starting fabric network", func() {
			var fabricVer = os.Getenv("FABRIC_VERSION")
			if fabricVer == "1" {
				networkSpecPath = "apitest-network-spec.yml"
			} else {
				networkSpecPath = "apitest-network-spec-v2.yml"
			}
			err := launcher.Launcher("up", "docker", "", networkSpecPath)
			Expect(err).NotTo(HaveOccurred())
		})

		It("Setup fabric network", func() {

			inputSpecPath = "apitest-input-multiprofile.yml"

			By("0) Generating channel artifacts")
			_, err := networkclient.ExecuteCommand("bash", []string{"./genchannelartifacts.sh"}, true)
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

			By("6) Sending Invokes")
			action = "invoke"
			err = testclient.Testclient(action, inputSpecPath)
			Expect(err).NotTo(HaveOccurred())

			time.Sleep(waitSyncInterval * time.Second)

		})

		It("launch explorer", func() {
			cwd, _ := os.Getwd()
			os.Chdir(relativePahtToRoot)
			os.RemoveAll("./logs")
			os.Chdir(cwd)

			cmd := exec.Command("bash", "./runexplorer.sh", "-m", "multi")
			err := cmd.Start()
			Expect(err).NotTo(HaveOccurred())
			Eventually(isExplorerReady, 60, 5).Should(Equal(true))

			time.Sleep(waitSyncInterval * time.Second)
		})

		Context("/auth/networklist", func() {
			It("get network list", func() {
				resp := restGet("/auth/networklist", &NetworklistInfo{})
				result := resp.Result().(*NetworklistInfo)
				list := []string{}
				for _, val := range result.NetworkList {
					list = append(list, val.Name)
				}
				Expect(list).Should(HaveLen(2))
				Expect(list).Should(ContainElements([]string{"org1-network", "org2-network"}))

			})
		})

		Context("/auth/login", func() {
			It("login to org1-network", func() {
				resp := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org1-network"}, &LoginResponse{})
				result := resp.Result().(*LoginResponse)
				Expect(result.User.Message).Should(Equal("logged in"))
				Expect(result.User.Name).Should(Equal("exploreradmin"))
			})

			It("login to org2-network", func() {
				resp := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org2-network"}, &LoginResponse{})
				result := resp.Result().(*LoginResponse)
				Expect(result.User.Message).Should(Equal("logged in"))
				Expect(result.User.Name).Should(Equal("exploreradmin"))
			})
		})

		Context("/api/channels", func() {
			It("get channels for Org1", func() {
				// For org1
				resp := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org1-network"}, &LoginResponse{})
				resultLogin := resp.Result().(*LoginResponse)
				token := resultLogin.Token
				Expect(resultLogin.User.Message).Should(Equal("logged in"))

				resp = restGetWithToken("/api/channels", &ChannelsResponse{}, token)
				result := resp.Result().(*ChannelsResponse)
				Expect(result.Channels).Should(ContainElements([]string{"org1channel", "commonchannel"}))
				Expect(len(result.Channels)).Should(Equal(2))
			})

			It("get channels for Org2", func() {
				// For org2
				resp := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org2-network"}, &LoginResponse{})
				resultLogin := resp.Result().(*LoginResponse)
				token := resultLogin.Token
				Expect(resultLogin.User.Message).Should(Equal("logged in"))

				resp = restGetWithToken("/api/channels", &ChannelsResponse{}, token)
				result := resp.Result().(*ChannelsResponse)
				Expect(result.Channels).Should(ContainElements([]string{"org2channel", "commonchannel"}))
				Expect(len(result.Channels)).Should(Equal(2))
			})
		})

		Context("/api/channels/info", func() {

			It("get channels info for org1", func() {

				resp1 := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org1-network"}, &LoginResponse{})
				result1 := resp1.Result().(*LoginResponse)
				token := result1.Token
				Expect(result1.User.Message).Should(Equal("logged in"))

				time.Sleep(waitSyncInterval * time.Second)

				resp2 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result2 := resp2.Result().(*ChannelsInfoResp)
				chList := result2.getChannelList()
				Expect(chList).Should(ContainElements([]string{"commonchannel", "org1channel"}))
				Expect(len(chList)).Should(Equal(2))
				fmt.Fprintf(GinkgoWriter, "Info: result2 %+v\n", result2)
				action := "invoke"
				inputSpecPath = "apitest-input-multiprofile-invoke-org1.yml"
				err := testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				time.Sleep(waitSyncInterval * time.Second)

				resp3 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result3 := resp3.Result().(*ChannelsInfoResp)
				fmt.Fprintf(GinkgoWriter, "Info: result3 %+v\n", result3)

				compareChannelsInfoBlockCount(result2, result3, "commonchannel", 0)
				compareChannelsInfoBlockCount(result2, result3, "org1channel", 1)
				compareChannelsInfoTxCount(result2, result3, "commonchannel", 0)
				compareChannelsInfoTxCount(result2, result3, "org1channel", 1)

				// action = "invoke"
				// inputSpecPath = "apitest-input-multiprofile-invoke-org2.yml"
				// err = testclient.Testclient(action, inputSpecPath)
				// Expect(err).NotTo(HaveOccurred())

				// time.Sleep(waitSyncInterval * time.Second)

				// resp4 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				// result4 := resp4.Result().(*ChannelsInfoResp)
				// fmt.Fprintf(GinkgoWriter, "Info: result4 %+v\n", result4)

				// compareChannelsInfoBlockCount(result3, result4, "commonchannel", 0)
				// compareChannelsInfoBlockCount(result3, result4, "org1channel", 0)
				// compareChannelsInfoTxCount(result3, result4, "commonchannel", 0)
				// compareChannelsInfoTxCount(result3, result4, "org1channel", 0)

				action = "invoke"
				inputSpecPath = "apitest-input-multiprofile-invoke-common.yml"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				time.Sleep(waitSyncInterval * time.Second)

				resp5 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result5 := resp5.Result().(*ChannelsInfoResp)
				fmt.Fprintf(GinkgoWriter, "Info: result5 %+v\n", result5)

				compareChannelsInfoBlockCount(result3, result5, "commonchannel", 1)
				compareChannelsInfoBlockCount(result3, result5, "org1channel", 0)
				compareChannelsInfoTxCount(result3, result5, "commonchannel", 1)
				compareChannelsInfoTxCount(result3, result5, "org1channel", 0)
			})

			It("get channels info for org2", func() {

				resp1 := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org2-network"}, &LoginResponse{})
				result1 := resp1.Result().(*LoginResponse)
				token := result1.Token
				Expect(result1.User.Message).Should(Equal("logged in"))

				time.Sleep(waitSyncInterval * time.Second)

				resp2 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result2 := resp2.Result().(*ChannelsInfoResp)
				chList := result2.getChannelList()
				Expect(chList).Should(ContainElements([]string{"commonchannel", "org2channel"}))
				Expect(len(chList)).Should(Equal(2))
				fmt.Fprintf(GinkgoWriter, "Info: result2 %+v\n", result2)

				action := "invoke"
				inputSpecPath = "apitest-input-multiprofile-invoke-org1.yml"
				err := testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				time.Sleep(waitSyncInterval * time.Second)

				resp3 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result3 := resp3.Result().(*ChannelsInfoResp)
				fmt.Fprintf(GinkgoWriter, "Info: result3 %+v\n", result3)

				compareChannelsInfoBlockCount(result2, result3, "commonchannel", 0)
				compareChannelsInfoBlockCount(result2, result3, "org2channel", 0)
				compareChannelsInfoTxCount(result2, result3, "commonchannel", 0)
				compareChannelsInfoTxCount(result2, result3, "org2channel", 0)

				// action = "invoke"
				// inputSpecPath = "apitest-input-multiprofile-invoke-org2.yml"
				// err = testclient.Testclient(action, inputSpecPath)
				// Expect(err).NotTo(HaveOccurred())

				// time.Sleep(waitSyncInterval * time.Second)

				// resp4 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				// result4 := resp4.Result().(*ChannelsInfoResp)
				// fmt.Fprintf(GinkgoWriter, "Info: result4 %+v\n", result4)

				// compareChannelsInfoBlockCount(result3, result4, "commonchannel", 0)
				// compareChannelsInfoBlockCount(result3, result4, "org2channel", 1)
				// compareChannelsInfoTxCount(result3, result4, "commonchannel", 0)
				// compareChannelsInfoTxCount(result3, result4, "org2channel", 1)

				action = "invoke"
				inputSpecPath = "apitest-input-multiprofile-invoke-common.yml"
				err = testclient.Testclient(action, inputSpecPath)
				Expect(err).NotTo(HaveOccurred())

				time.Sleep(waitSyncInterval * time.Second)

				resp5 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result5 := resp5.Result().(*ChannelsInfoResp)
				fmt.Fprintf(GinkgoWriter, "Info: result5 %+v\n", result5)

				compareChannelsInfoBlockCount(result3, result5, "commonchannel", 1)
				compareChannelsInfoBlockCount(result3, result5, "org2channel", 0)
				compareChannelsInfoTxCount(result3, result5, "commonchannel", 1)
				compareChannelsInfoTxCount(result3, result5, "org2channel", 0)
			})
		})

		Context("/api/block/(channelHash)/(blockHeight)", func() {

			It("get block info for org1", func() {

				resp1 := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org1-network"}, &LoginResponse{})
				result1 := resp1.Result().(*LoginResponse)
				token := result1.Token
				Expect(result1.User.Message).Should(Equal("logged in"))

				resp2 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result2 := resp2.Result().(*ChannelsInfoResp)

				channelGenesisHash := result2.getGenesisHash("org1channel")
				latestBlockNum := result2.getBlockHeight("org1channel") - 1
				Expect(len(channelGenesisHash)).ShouldNot(Equal(0))

				resp3 := restGetWithToken("/api/block/"+channelGenesisHash+"/"+strconv.Itoa(latestBlockNum), &BlockResp{}, token)
				result3 := resp3.Result().(*BlockResp)
				Expect(result3.Status).Should(Equal(200))
				Expect(strconv.Atoi(result3.Number)).Should(Equal(latestBlockNum))
				Expect(len(result3.Transactions)).Should(Equal(1))

				channelGenesisHash = result2.getGenesisHash("commonchannel")
				latestBlockNum = result2.getBlockHeight("commonchannel") - 1
				Expect(len(channelGenesisHash)).ShouldNot(Equal(0))

				resp3 = restGetWithToken("/api/block/"+channelGenesisHash+"/"+strconv.Itoa(latestBlockNum), &BlockResp{}, token)
				result3 = resp3.Result().(*BlockResp)
				Expect(result3.Status).Should(Equal(200))
				Expect(strconv.Atoi(result3.Number)).Should(Equal(latestBlockNum))
				Expect(len(result3.Transactions)).Should(Equal(1))
			})

			It("get block info for org2", func() {

				resp1 := restPost("/auth/login", map[string]interface{}{"user": "exploreradmin", "password": "exploreradminpw", "network": "org2-network"}, &LoginResponse{})
				result1 := resp1.Result().(*LoginResponse)
				token := result1.Token
				Expect(result1.User.Message).Should(Equal("logged in"))

				resp2 := restGetWithToken("/api/channels/info", &ChannelsInfoResp{}, token)
				result2 := resp2.Result().(*ChannelsInfoResp)

				channelGenesisHash := result2.getGenesisHash("org2channel")
				latestBlockNum := result2.getBlockHeight("org2channel") - 1
				Expect(len(channelGenesisHash)).ShouldNot(Equal(0))

				resp3 := restGetWithToken("/api/block/"+channelGenesisHash+"/"+strconv.Itoa(latestBlockNum), &BlockResp{}, token)
				result3 := resp3.Result().(*BlockResp)
				Expect(result3.Status).Should(Equal(200))
				Expect(strconv.Atoi(result3.Number)).Should(Equal(latestBlockNum))
				Expect(len(result3.Transactions)).Should(Equal(1))

				channelGenesisHash = result2.getGenesisHash("commonchannel")
				latestBlockNum = result2.getBlockHeight("commonchannel") - 1
				Expect(len(channelGenesisHash)).ShouldNot(Equal(0))

				resp3 = restGetWithToken("/api/block/"+channelGenesisHash+"/"+strconv.Itoa(latestBlockNum), &BlockResp{}, token)
				result3 = resp3.Result().(*BlockResp)
				Expect(result3.Status).Should(Equal(200))
				Expect(strconv.Atoi(result3.Number)).Should(Equal(latestBlockNum))
				Expect(len(result3.Transactions)).Should(Equal(1))
			})
		})

		// It("get status of peers within org2channel", func() {
		// 	resp := restGetWithToken("/api/peersStatus/"+"org2channel", &PeersStatusResp{}, token)
		// 	result := resp.Result().(*PeersStatusResp)
		// 	Expect(result.Status).Should(Equal(200))
		// })

		// It("get block activity", func() {
		// 	resp := restGetWithToken("/api/blockActivity/"+channelGenesisHash, &BlockActivityResp{}, token)
		// 	result := resp.Result().(*BlockActivityResp)
		// 	Expect(result.Status).Should(Equal(200))
		// 	Expect(result.Row[0].Channelname).Should(Equal("org2channel"))
		// 	org2CurrentBlockNum = result.Row[0].Blocknum
		// })

		// It("Update block on org1channel and should not have any changes on org2channel", func() {
		// 	resp := restGetWithToken("/blockActivity/"+channelGenesisHash,&
		// 	action = "invoke"
		// 	inputSpecPath = "apitest-input-multiprofile-invoke-org1.yml"
		// 	err := testclient.Testclient(action, inputSpecPath)
		// 	Expect(err).NotTo(HaveOccurred())

		// 	resp := restGetWithToken("/api/blockActivity/"+channelGenesisHash, &BlockActivityResp{}, token)
		// 	result := resp.Result().(*BlockActivityResp)
		// 	Expect(result.Status).Should(Equal(200))
		// 	Expect(result.Row[0].Channelname).Should(Equal("org2channel"))
		// 	Expect(result.Row[0].Blocknum).Should(Equal(org2CurrentBlockNum))
		// })

		// It("Update block on org2channel and should have some changes on org2channel", func() {
		// 	action = "invoke"
		// 	inputSpecPath = "apitest-input-multiprofile-invoke-org2.yml"
		// 	err := testclient.Testclient(action, inputSpecPath)
		// 	Expect(err).NotTo(HaveOccurred())

		// 	resp := restGetWithToken("/api/blockActivity/"+channelGenesisHash, &BlockActivityResp{}, token)
		// 	result := resp.Result().(*BlockActivityResp)
		// 	Expect(result.Status).Should(Equal(200))
		// 	Expect(result.Row[0].Channelname).Should(Equal("org2channel"))
		// 	Expect(result.Row[0].Blocknum).Should(Equal(org2CurrentBlockNum + 1))
		// })

		// XIt("register user", func() {
		// 	resp := restPostWithToken("/api/register", map[string]interface{}{"user": "test", "password": "test", "affiliation": "department2", "role": "admin"}, &RegisterResp{}, token)
		// 	resultRegister := resp.Result().(*RegisterResp)
		// 	Expect(resultRegister.Status).Should(Equal(200))
		// })

		// XIt("login with newly registered user", func() {
		// 	resp := restPost("/auth/login", map[string]interface{}{"user": "test", "password": "test", "network": "org2-network"}, &LoginResponse{})
		// 	resultLogin := resp.Result().(*LoginResponse)

		// 	Expect(resultLogin.User.Message).Should(Equal("logged in"))
		// 	Expect(resultLogin.User.Name).Should(Equal("test"))
		// })

		// XIt("fail to register duplicate user", func() {
		// 	resp := restPostWithToken("/api/register", map[string]interface{}{"user": "test", "password": "test", "affiliation": "department2", "role": "admin"}, &RegisterResp{}, token)
		// 	resultRegister := resp.Result().(*RegisterResp)
		// 	Expect(resultRegister.Status).Should(Equal(400))
		// 	Expect(resultRegister.Message).Should(Equal("Error: already exists"))
		// })

		It("stop explorer", func() {
			_, err := networkclient.ExecuteCommand("bash", []string{"./stopexplorer.sh"}, true)
			Expect(err).NotTo(HaveOccurred())
		})

		It("Shutdown network", func() {
			cleanupContainers(networkSpecPath)
		})
	})

})
