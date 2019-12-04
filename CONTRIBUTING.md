
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# Contributing to Hyperledger Explorer

We welcome contributions to the Hyperledger Explorer Project in many forms like bug reports, feature requests,  documentation updates, code.


## Bug Reports and Feature Requests

We track all bugs and feature requests on [Hyperledger Explorer Jira](https://jira.hyperledger.org/projects/BE/issues). Please send a detailed bug report with relevant logs and steps to reproduce the issue when you encounter an issue. We always appreciate such bug reports as it reduces our effort and will help us fix the bug easily. Please use the search functionality to ensure that the bug/feature request you are trying to file does not exist already. If it exists, you can always add additional information to the JIRA issue in the comments sections and start watching for updates. All the issue here will be added to our backlog and prioritized in the upcoming sprints.

You can contact the developers for any general problems or questions on [Hyperledger Chat](https://chat.hyperledger.org/channel/hyperledger-explorer).

## Documentation updates

You are always welcome to contribute documentation updates and code in the form the patch submissions on [Hyperledger Explorer GitHub](https://github.com/hyperledger/blockchain-explorer).

The code is structured into two main categories
* ReactJS UI (client folder)
* NodeJS back-end (all other folders)


## Code contribution and submitting your fix


If you just submitted a JIRA for a bug you've discovered, and would like to
provide a fix, we would welcome that gladly! Please assign the JIRA issue to
yourself, then you can submit a change request (PR), please follow guidance provided by
[GitHub](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests).

<!--  Contributing -->

#To contribute changes, use the following workflow:

1. [**Fork the repository**](https://github.com/hyperledger/blockchain-explorer/fork).
1. **Clone your fork** to your computer.
1. **Create a topic branch** and name it appropriately.
Starting the branch name with the issue number is a good practice and a reminder to fix only one issue in a
Pull-Request (PR).
1. **Make your changes** adhering to the coding conventions described below.
In general a commit serves a single purpose and diffs should be easily comprehensible.
For this reason do not mix any formatting fixes or code moves with actual code changes.
1. **Commit your changes** see [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/) article by Chris Beams.
1. **Test your changes** locally before pushing to ensure that what you are proposing is not breaking
another part of the software.
Running the ```  ./main.sh clean && ./main.sh install && ./main.sh test ``` command locally will help you to be confident that your changes will
pass CI tests once pushed as a Pull Request.
1. **Push your changes** to your remote fork.
1. **Create a pull-request** (PR) on the Hyperledger Explorer repository. If the PR addresses an existing Jira issue,
include the issue number in the PR title in square brackets (for example, `BE-333`).
1. **Add labels** to identify the type of your PR. For example, if your PR is not ready to validate,
add the "work-in-progress" label. If it fixes a bug, add the "bug" label.
1. If the PR address an existing Jira issue, comment in the Jira issue with the PR number.
1. **Ensure your changes are reviewed**.
Select the reviewers you would like to review your PR.
If you don't know who to choose, simply select the reviewers proposed by GitHub or leave blank.
1. **Make any required changes** on your contribution from the reviewers feedback.
Make the changes, commit to your branch, and push to your remote fork.
1. **When your PR is validated**, all tests passed and your branch has no conflicts with the target branch,
you can **"squash and merge"** your PR and you're done.

<!--  Contributing -->

### Copyright Notices

There should be a single LICENSE file in the top-level directory that contains the full text of the Apache License [here](http://www.apache.org/licenses/LICENSE-2.0).
In the individual files, please use the following line, and appropriate comment by the file type.

`SPDX-License-Identifier: Apache-2.0`

*example for a .js file type*
```
/*
* SPDX-License-Identifier: Apache-2.0
*/

```

Regarding copyright notices, we generally find that copyright notices in headers fall out of date quickly. The contributor data is stored in git and determining "copyright" requires an analysis that becomes quite complex after the initial commit.

DO NOT remove copyright notices that are already in a file unless they're removed by the copyright owner.

If it is a new file that does not have a copyright notice, you can say something like "Copyright Hyperledger and its contributors."

Finally, thank you for reading this document and your future contributions.
