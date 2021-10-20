#!/bin/bash

#
#    SPDX-License-Identifier: Apache-2.0
#

GREP_MATCH=0  # Exit status of grep command:  0=Matched,  1=Unmatched
LICENSE_HEADER="SPDX-License-Identifier"
retval=0

usage() { echo "Usage: $0 [-a]" 1>&2; exit 1; }

checkall=0
while getopts "ah" o; do
  case "${o}" in
    a)
      echo "Checking all files which have already been committed"
      checkall=1
      ;;
    h)
      usage
      ;;
    *)
      usage
      ;;
  esac
done

echo -e "\tChecking files with no license header ..."

if [[ ${checkall} -eq 1 ]]; then
  check_files=$(git ls-files)
else
  check_files=$(git diff HEAD --name-only --cached)
fi

# If you want to exclude some paths, add a keyword with an extended regular expression format to excluded_paths
excluded_paths="\.ico$ \.jpg$ \.json$ \.png$ \.svg$ \.tx$ \.crt$ \.ya*ml$ \.key$ \.pem$ _sk$ \/META-INF\/ LICENSE$ \.xml$ CHANGELOG\.md$ app/platform/fabric/e2e-test go\.sum$ \.opts$ \.env$"

for check_file in ${check_files}; do

  file -ib ${check_file} | grep -qE "^text/"
  if [[ $? -eq ${GREP_MATCH} ]]; then

    # Only files which mime-type is 'text/*'

    isExclude=0
    for excluded_path in ${excluded_paths}; do
      # Exclude specific files from checking
      echo ${check_file} | grep -qE "${excluded_path}"
      if [[ $? -eq ${GREP_MATCH} ]]; then
        # echo "EXCLUDED -- ${check_file}"
        isExclude=1
        break
      fi
    done
    if [[ ${isExclude} -eq 1 ]]; then continue; fi

    git show :${check_file} | grep -q ${LICENSE_HEADER}
    if [[ $? -ne ${GREP_MATCH} ]]; then
      detected_files="${detected_files} ${check_file}"
      # If find at least 1 file that doesn't contain lincense header, return non-zero
      retval=1
    fi
  fi
done

if [[ ${retval} -ne 0 ]]; then
  echo -e "\tDetected files with no license header!"
  echo -e "\t--------------------------------------"
  for detected_file in ${detected_files}; do
    echo -e "\t${detected_file}"
  done
  echo -e "\t--------------------------------------"
fi

exit ${retval}
