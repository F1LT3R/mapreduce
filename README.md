# MapReduce

> A Distributed MapReduce Example

## Features

- Spawns a cluster of `n` Workers
- Uses JSON over Sockets for server-client communication.
- Uses JSON between Master and Workers in the cluster.
- Can specify `--port` and `--host` for Client and Server.
- The Server can handle multiple clients.
- The Client can send multiple files.
- This example uses zero dependencies.

## Contents

- [Features](#features)
- [Contents](#contents)
- [Pre-Requisites](#pre-requisites)
- [Setup](#setup)
- [Usage](#usage)
  - [Basic](#basic)
  - [Sending Multiple Files](#sending-multiple-files)
- [Options](#options)
  - [`--help`](#--help)
  - [`--port`, `--host`](#--port---host)
  - [`workers`](#workers)
- [Implementation Details](#implementation-details)
  - [Worker Pull](#worker-pull)
  - [HTTP vs. Sockets](#http-vs-sockets)
- [Failures](#failures)

## Pre-Requisites

- Node.js - I'm using `v14.6.0`
- Git

## Setup

```shell
git clone git@github.com:F1LT3R/mapreduce.git
cd mapreduce
npm link
```

## Usage

### Basic

Start the mapreduce server:

```shell
mapreduce --server
```

Send a file to the client:

```shell
mapreduce --client test/fixtures/arrays.txt
```

You should see the output:

```shell
test/fixtures/arrays.txt
Array 1: 445
Array 2: 30
Array 3: 783
Total: 1258
```

### Sending Multiple Files

To send multiple files:

```shell
mapreduce --client test/fixtures/arrays.txt test/fixtures/arrays-spaces-tabs.txt
```

You should now see the following output:

```shell
test/fixtures/arrays.txt
Array 1: 445
Array 2: 30
Array 3: 783
Total: 1258

test/fixtures/arrays-spaces-tabs.txt
Array 1: 445
Array 2: 30
Array 3: 783
Total: 1258
```

## Options

### `--help`

Get a list of commands and their usage in the terminal.

### `--port`, `--host`

Run the server on port 8081:

```shell
mapreduce --port 8081 --host 127.0.0.1 --server
```

Run the client on port 8081:

```shell
mapreduce --port 8081 --host 127.0.0.1 --client test/fixtures/arrays.txt
```

### `workers`

Spawn 5 worker processes on the server:

```shell
mapreduce --server 5
```

## Implementation Details

### Worker Pull

I tried to implement a protocol where the Workers were responsible for calling out to the Master when they were ready for more work. This meant passing the messages from the Master to the Server and then onto the Client. So this implementation uses a PULL model, where the lines are being pulled from the client at the request of the server. I felt like this was going to be a better idea than having clients bomb the server at will.

Unfortunately, this implementation relies on a timer in the worker to initiate the pull requests. I wanted to develop out the protocol layer, so that the workers informed the master/server of their state, and would respond to proxy events on the workQueue, but again, time was difficult for me in this challenge.

### HTTP vs. Sockets

I tried implementing an HTTP interface as well as a Sockets interface. I found that the Sockets vastly outperformed the HTTP requests so I stuck with it. At first I was implementing my own null terminator and using raw sockets. I got pretty far with this, but eventually had to reach for a small JsonSocket wrapper that someone else had written. I found this in a GitHub repo.

## Failures

- Not all errors are handled gracefully.
- I do not feel like the code is as well organized, ot as cleanly written as I would have liked.
- I needed to relied on copy+pasting some code I found in a GitHub repo for the JsonSocket wrapper. I would liked to have had the time to do more research and write this part on my own.
- I was not able to complete the check for whether the server is already running, in the time allowed.
- I spent too much time on the plumbing, and not enough on the protocol.

Unfortunately many of the things I hoped to get to, were difficult to finished in the time allowed. Using absolutely no dependencies really slowed me down. But on the flips-side, I've not had this much fun programming in a long time, and I feel like I've learn a lot!
