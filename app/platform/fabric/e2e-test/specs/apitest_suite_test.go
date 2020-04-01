package apitest

import (
	"testing"

	. "github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/reporters"
	. "github.com/onsi/gomega"
)

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
})
