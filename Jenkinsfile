// Copyright IBM Corp All Rights Reserved
//
// SPDX-License-Identifier: Apache-2.0
//
timeout(40) {
node ('hyp-x') { // trigger build on x86_64 node
 timestamps {
    try {
     def ROOTDIR = pwd() // workspace dir (/w/workspace/<job_name>)
     def nodeHome = tool 'nodejs-8.11.3'
     env.ARCH = "amd64"
     env.GOPATH = "$WORKSPACE/gopath"
     env.PATH = "$GOPATH/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:${nodeHome}/bin:$PATH"
     def jobname = sh(returnStdout: true, script: 'echo ${JOB_NAME} | grep -q "verify" && echo patchset || echo merge').trim()
     def failure_stage = "none"
// delete working directory
     deleteDir()
      stage("Fetch Patchset") {
          try {
             if (jobname == "patchset")  {
                   println "$GERRIT_REFSPEC"
                   println "$GERRIT_BRANCH"
                   checkout([
                       $class: 'GitSCM',
                       branches: [[name: '$GERRIT_REFSPEC']],
                       extensions: [[$class: 'CheckoutOption', timeout: 10]],
                       userRemoteConfigs: [[credentialsId: 'hyperledger-jobbuilder', name: 'origin', refspec: '$GERRIT_REFSPEC:$GERRIT_REFSPEC', url: '$GIT_BASE']]])
              } else {
                   // Clone fabric-sdk-node on merge
                   println "Clone $PROJECT repository"
                   checkout([
                       $class: 'GitSCM',
                       branches: [[name: 'refs/heads/$GERRIT_BRANCH']],
                       userRemoteConfigs: [[credentialsId: 'hyperledger-jobbuilder', name: 'origin', refspec: '+refs/heads/$GERRIT_BRANCH:refs/remotes/origin/$GERRIT_BRANCH', url: '$GIT_BASE']]])
              }
              dir("${ROOTDIR}") {
              sh '''
                 # Print last two commit details
                 echo
                 git log -n2 --pretty=oneline --abbrev-commit
                 echo
              '''
              }
          }
          catch (err) {
                 failure_stage = "Fetch patchset"
                 throw err
          }
       }
// clean environment and get env data
      stage("Clean Environment - Get Env Info") {
          wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
           try {
                 dir("${ROOTDIR}/Jenkins_Script") {
                 sh './CI_Script.sh --clean_Environment --env_Info'
                 }
               }
           catch (err) {
                 failure_stage = "Clean Environment - Get Env Info"
                 throw err
           }
          }
         }

// Run npm tests
    stage("NPM Tests") {
        wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
            try {
                dir("${ROOTDIR}") {
                sh '''
                    npm config set prefix ~/npm && npm install -g mocha
                    npm install chai && npm install
                    cd app/test && npm install
                    npm run test
                    cd ../../client && npm install
                    echo "--------> npm tests with code coverage"
                    npm run test:ci -- -u --coverage && npm run build
                '''
                 }
               }
            catch (err) {
                 failure_stage = "npm tests"
                 currentBuild.result = 'FAILURE'
                 throw err
            }
        }
    }

    // // Run npm tests
    // stage("E2E Tests for Sanity-check") {
    //     wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
    //         try {
    //             dir("${ROOTDIR}") {
    //             sh '''
    //                 npm install
    //                 npm run e2e-test-sanitycheck:ci
    //             '''
    //              }
    //            }
    //         catch (err) {
    //              failure_stage = "e2e tests"
    //              currentBuild.result = 'FAILURE'
    //              throw err
    //         }
    //     }
    // }

    // Run npm tests
    //stage("E2E Tests of GUI for Sanity-check") {
    //    wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
    //        try {
    //            dir("${ROOTDIR}") {
    //            sh '''
    //                npm install
    //                npm run e2e-gui-test:ci
    //            '''
    //             }
    //           }
    //        catch (err) {
    //             failure_stage = "e2e tests for GUI"
    //             currentBuild.result = 'FAILURE'
    //             throw err
    //        }
    //    }
    //}

      // Docs HTML Report
	stage("Doc Output") {
		wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
			dir("${ROOTDIR}") {
				publishHTML([allowMissing: false,
				alwaysLinkToLastBuild: true,
				keepAll: true,
				reportDir:
				'client/coverage/lcov-report',
				reportFiles: 'index.html',
				reportName: 'Code Coverage Report'
				])
			}
		}
	}
    } finally {
           if (env.JOB_NAME == "blockchain-explorer-merge-x86_64") {
              if (currentBuild.result == 'FAILURE') { // Other values: SUCCESS, UNSTABLE
               // Sends merge failure notifications to Jenkins-robot RocketChat Channel
               rocketSend message: "Build Notification - STATUS: *${currentBuild.result}* - BRANCH: *${env.GERRIT_BRANCH}* - PROJECT: *${env.PROJECT}* - BUILD_URL:  (<${env.BUILD_URL}|Open>)"
              }
           }
      } // finally block
  } // timestamps block
} // node block block
} // timeout block
