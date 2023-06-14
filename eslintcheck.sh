#!/bin/bash
list=("controllers" "routes" "utils")
for x in "${list[@]}"
do
  cd "$x" # change directory to the folder name
  for f in *.js # loop through all js files
  do
    echo "$f" # print the file name
    npx eslint "$f" --fix # run the command on the file
  done
  cd .. # go back to the parent directory
done
