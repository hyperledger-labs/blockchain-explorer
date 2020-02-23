package apitest

import (
	"strings"
	"testing"

	. "github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/reporters"
	. "github.com/onsi/gomega"

	"github.com/hyperledger/fabric-test/tools/operator/launcher"
	"github.com/hyperledger/fabric-test/tools/operator/networkclient"
)

func TestRestApi(t *testing.T) {
	RegisterFailHandler(Fail)
	junitReporter := reporters.NewJUnitReporter("results_rest-api-test-suite.xml")
	RunSpecsWithDefaultAndCustomReporters(t, "Rest Api Test Suite", []Reporter{junitReporter})
}

// Bringing up network using BeforeSuite
var _ = BeforeSuite(func() {
	networkSpecPath := "apitest-network-spec.yml"
	err := launcher.Launcher("up", "docker", "", networkSpecPath)
	Expect(err).NotTo(HaveOccurred())
})

// Cleaning up network launched from BeforeSuite and removing all chaincode containers
// and chaincode container images using AfterSuite
var _ = AfterSuite(func() {
	networkSpecPath := "apitest-network-spec.yml"
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
