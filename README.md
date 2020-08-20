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
- [The Overall Strategy](#the-overall-strategy)

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

Unfortunately many of the things I hoped to get to, were difficult to finish in the time allowed. Using zero dependencies slowed me down more than expected. On the flips-side, I've not had this much fun programming in a long time, and I have learned a lot!

## The Overall Strategy

The following code and comments demonstrate a refinement of the protocol I envisioned, as well the reasons I considered the pull strategy an efficient approach.

```javascript
/*
  NOTES

  This protocol follows a pull model. The Workers are responsible for notifying 
  the Server that they are READY_FOR_WORK. The Server then requests work from 
  the active Clients. Only work that "can be done right now", will ever move 
  through the network; Reducing load, and preventing bottlenecks across 
  multiple areas of the system.

  We cannot know:

  1. When the Client will connect.
  2. When the Client have lines ready to send.
  3. When a Worker will be READY_FOR_WORK.

  Because of these properties, race conditions will abound, and the use of an 
  interval timer is required. At this interval the Server reads which Workers 
  are free, and requests new work from the Clients. The Server acts as a relay 
  between the Client and the Workers. To maximize the opportunity to mediate
  through various edge cases, the control timer should live on the server,
  as it is the only node in the system in direct communication with all other
  nodes.
  
  An alternate model would be for the Clients to push all of the lines to the 
  server when they connect, with the Server distributing the work among the 
  Workers. But if the Server is overloaded, it may be tricky, and in some cases
  impossible for the Server to ask the Client to slow down. This alternate model 
  may also require a large work queue to sit in Server memory, draining 
  resources that were not strictly necessary to be used at the time.

  "Inventory is waste." See: "The Goal"
  https://en.wikipedia.org/wiki/The_Goal_%28novel%29

*/

const messages = [
  // THE HAPPY PATH
  {
    worker: {
      to: {
        server: { READY_FOR_WORK: ({ workerPID }) => ({ workerPID }) },
        // The Worker informs the server it is ready to process work.
      },
    },
  },

  {
    client: {
      to: {
        server: { REQUEST_CONNECTION: ({ clientId }) => ({ clientId }) },
        // Client notifies server that it would like to make a connection.
      },
    },
  },

  {
    server: {
      to: {
        client: { CONFIRM_CONNECTION: ({ serverId }) => ({ serverId }) },
        // The server responds to confirm that the connection was successful.
        // The server will store the connection in the `clients` pool.
      },
    },
  },

  {
    server: {
      to: {
        client: {
          REQUEST_WORK: ({ serverId, numberOfJobs, linesEachJob }) => ({
            // The Server knows it has Workers that are READY_FOR_WORK.
            // The Server requests jobs from the client(s).

            // WEIGHTING
            // 1. Server requests job count equal to n Workers READY_FOR_WORK.
            // 2. Server requests n of lines per job, based on Worker throughput.

            // DISTRIBUTION:
            // 1. When there are 2 Workers READY_FOR_WORK, but only 1 client,
            //    that 1 Client will be asked for 2 jobs.
            // 2. When there is 1 Worker READY_FOR_WORK and 2 Clients, work will
            //    only be requested from 1 Client.

            serverId,
            numberOfJobs, // Same as number of free workers.
            linesEachJob, // Number of lines to include for each job.
          }),
        },
      },
    },
  },

  {
    client: {
      to: {
        server: {
          SEND_WORK: ({ clientId, jobs }) => ({
            // The Client sends work back to the Server in the form of Jobs.
            // Each job contains an array of line data for the Worker to reduce.
            // Each job contains the range of the lines on the Client stack.

            // JOB:
            // {
            //   lines: [
            //     '2, 4, 6',
            //     '6, 4, 2'
            //   ],
            //   range: {start: 0, end: 1}
            // }

            clientId,
            jobs, // Array of job objects for the Workers to consume.
          }),
        },
      },
    },
  },

  {
    server: {
      to: {
        worker: {
          EXECUTE_WORK: ({ jobs }) => ({ jobs }),
          // The Server shifts a Job(s) from the pendingJobs queue to the
          // currentJobs queue. The server sends the Job(s) to the next Worker
          // that indicates it is READY_FOR_WORK.
        },
      },
    },
  },

  {
    worker: {
      to: {
        server: {
          WORK_FINISHED: ({ workerPID, job }) => ({ workerPID, job }),
          // The Worker responds to the Server with a finished job. The Server
          // shifts the result onto the resultsStack. asd
        },
      },
    },
  },

  {
    worker: {
      to: {
        server: { READY_FOR_WORK: ({ workerPID }) => ({ workerPID }) },
        // Again, the Worker informs the server it is ready to process work.
      },
    },
  },

  {
    server: {
      to: {
        client: {
          WORK_RESULTS: ({ serverId, results }) => ({
            // The Server shifts finished Jobs from the workResults stack and
            // forwards them onto the relevant Client in a results array.
            // Each result contains a lines array with the reduced values.
            // Each result contains a range for the Client to update the table.
            // The Client is responsible for the final tally.

            // RESULT:
            // {
            //   lines: [
            //     12,
            //     12
            //   ],
            //   range: {start: 0, end: 1}
            // }

            serverId,
            results,
          }),
        },
      },
    },
  },

  // ERROR: NOT A NUMBER
  {
    worker: {
      to: {
        server: {
          NAN_ERROR: ({ serverId, line, value, clientId }) => ({
            // The Worker will report any errors to the Server when encountering
            // values that are not calculable, such as strings.

            serverId,
            line, // The line at which the error was found.
            value, // The string value of the offending index.
          }),
        },
      },
    },
  },

  {
    server: {
      to: {
        workers: {
          ALL_STOP: ({ serverId }) => ({ serverId }),
          // The Server will call ALL_STOP when a Worker encounters an error.
          // ALL_STOP is sent to all Workers.
        },
      },
    },
  },

  {
    server: {
      to: {
        client: {
          NAN_ERROR: ({ serverId }) => ({ serverId }),
          // The Server will notify the Client that the error was encountered.
          // The Client will quit.
        },
      },
    },
  },

  // EDGE CASE: CLIENT SENT ALL LINES
  {
    client: {
      to: {
        server: {
          NO_MORE_LINES: ({ clientId }) => ({ clientId }),
          // The Client will notify the Server it has finished sending all the
          // lines. The Server will no longer REQUEST_WORK from this Client.
        },
      },
    },
  },

  // EDGE CASE: UNRECOVERABLE SERVER ERROR
  {
    server: {
      to: {
        clients: {
          UNRECOVERABLE_ERROR: ({ serverId }) => ({ serverId }),
          // The Server will inform all connected Clients that it has
          // encountered an UNRECOVERABLE_ERROR. Workers will be closed where
          // possible. The Clients will shut down gracefully.
        },
      },
    },
  },
];
```
