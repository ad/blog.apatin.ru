+++
title = "Github Actions и автоматическое создание релизов на Go"
date = "2019-09-27T12:26:00+03:00"
tags = [
    "техническое",
    "github",
    "go"
]
+++

Если вам как и мне надоело делать релизы на Github для тех кто хочет попробовать последние изменения в коде, то можно автоматизировать это средствами самого Github, а именно Github Actions.

<!--more-->

Следующий код при коммите создаст (или обновит релиз с именем/тэгом latest) и выложит в него собранные бинарники под linux/os x/arm/windows.

```
name: Release on commit or tag
on:
  push:
    branches:
    - master
    - release/*
jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Set up Go 1.13
        uses: actions/setup-go@v1
        with:
          go-version: 1.13

      - name: Check out source code
        uses: actions/checkout@master

      - name: Build OS X binary
        run: GOOS=darwin GOARCH=amd64 go build -o $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2)-darwin64 -a -ldflags '-s -w' .
        
      - name: Build Linux binary
        run: GOOS=linux GOARCH=amd64 go build -o $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2)-linux64 -a -ldflags '-s -w' .
     
      - name: Build ARM binary
        run: GOOS=linux GOARCH=arm GOARM=6 go build -o $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2)-arm -a -ldflags '-s -w' .
        
      - name: Build Windows binary
        run: GOOS=windows GOARCH=amd64 go build -o $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2).exe -a -ldflags '-s -w' .
        
      - name: Install olsu
        run: wget https://github.com/Telling/olsu/releases/download/v0.1.0/olsu-linux-amd64.zip && unzip olsu-linux-amd64.zip && chmod +x olsu-linux-amd64 && pwd && ls -la
        
      - name: Create or update release
        env:
          OLSU_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OLSU_DELETE_RELEASE: yes
        run: ./olsu-linux-amd64 -o $(echo $GITHUB_REPOSITORY | cut -d "/" -f 1) -r $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2) "Latest release" "latest" "Automatic release" $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2)-darwin64 $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2)-linux64 $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2)-arm $(echo $GITHUB_REPOSITORY | cut -d "/" -f 2).exe
```
