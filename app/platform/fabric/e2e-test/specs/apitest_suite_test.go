package apitest

import (
	"fmt"
	"os"
	"os/exec"
	"testing"

	. "github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/reporters"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/gexec"
)

var failed = false

func TestRestApi(t *testing.T) {
	RegisterFailHandler(Fail)
	junitReporter := reporters.NewJUnitReporter("results_rest-api-test-suite.xml")
	RunSpecsWithDefaultAndCustomReporters(t, "Rest Api Test Suite", []Reporter{junitReporter})
}

// Bringing up network using BeforeSuite
var _ = BeforeSuite(func() {
})

// Cleaning up network launched from BeforeSuite and removing all chaincode containers
// and chaincode container images using AfterSuite
var _ = AfterSuite(func() {
	if failed {
		dumpLog()
	}
})

var _ = AfterEach(func() {
	failed = failed || CurrentGinkgoTestDescription().Failed
})

func dumpLog() {
	cwd, _ := os.Getwd()
	fmt.Println("=== Dump Explorer app log ===")
	fmt.Println(cwd)
	os.Chdir(relativePahtToRoot)
	cmd := exec.Command("docker", "logs", "explorer.mynetwork.com")
	session, err := gexec.Start(cmd, GinkgoWriter, GinkgoWriter)
	Expect(err).ShouldNot(HaveOccurred())
	session.Wait()
}
