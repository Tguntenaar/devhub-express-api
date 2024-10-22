import express, { type Request, type Response } from 'express';
import bodyParser from 'body-parser';
import { type ContractCallArgs,
  type AddMember,
  type AddProposal,
  type AddRfp,
  type CancelRfp,
  type CreateCommunity,
  type EditMember,
  type EditProposal,
  type GetCommunity,
  type GetProposal } from './contract_types';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

interface FunctionCallAction {
  type: "FunctionCall";
  params: {
    methodName: string;
    args: object;
    gas: string;
    deposit: string;
  };
}

const CONTRACT_ID = "devhub.near";

app.post('/api/add_member', (req: Request, res: Response) => {
  const { member, metadata }: AddMember = req.body;

  if (!member || !metadata) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "add_member",
      args: { member, metadata },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.post('/api/add_proposal', (req: Request, res: Response) => {
  const { body, labels, accepted_terms_and_conditions_version }: AddProposal = req.body;

  if (!body || !labels || !accepted_terms_and_conditions_version) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "add_proposal",
      args: { body, labels, accepted_terms_and_conditions_version },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.post('/api/add_rfp', (req: Request, res: Response) => {
  const { body, labels }: AddRfp = req.body;

  if (!body || !labels) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "add_rfp",
      args: { body, labels },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.post('/api/cancel_rfp', (req: Request, res: Response) => {
  const { id, proposals_to_cancel, proposals_to_unlink }: CancelRfp = req.body;

  if (id === undefined || !Array.isArray(proposals_to_cancel) || !Array.isArray(proposals_to_unlink)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "cancel_rfp",
      args: { id, proposals_to_cancel, proposals_to_unlink },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.post('/api/create_community', (req: Request, res: Response) => {
  const { inputs }: CreateCommunity = req.body;

  if (!inputs) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "create_community",
      args: { inputs },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.post('/api/edit_member', (req: Request, res: Response) => {
  const { member, metadata }: EditMember = req.body;

  if (!member || !metadata) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "edit_member",
      args: { member, metadata },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.post('/api/edit_proposal', (req: Request, res: Response) => {
  const { id, body, labels }: EditProposal = req.body;

  if (id === undefined || !body || !labels) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "edit_proposal",
      args: { id, body, labels },
      gas: "30000000000000",
      deposit: "1"
    }
  };

  return res.json(functionCall);
});

app.get('/api/get_community', async (req: Request, res: Response) => {
  const { handle }: GetCommunity = req.query as unknown as GetCommunity;

  if (!handle) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const response = await fetch("https://rpc.mainnet.near.org", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT_ID,
        method_name: "get_community",
        args_base64: Buffer.from(JSON.stringify({ handle })).toString('base64')
      }
    })
  });

  const data = await response.json();
  let deserializedResult;

  if (Array.isArray(data.result.result)) {
    deserializedResult = String.fromCharCode(...data.result.result);
  } else {
    deserializedResult = data.result.result;
  }

  return res.json(deserializedResult);
});

app.get('/api/get_proposal', async (req: Request, res: Response) => {
  const { proposal_id }: GetProposal = req.query as unknown as GetProposal;

  console.log("proposal_id",proposal_id);

  if (proposal_id === undefined) {
    return res.status(400).json({ error: "Invalid input" });
  }

  let body = JSON.stringify({
    jsonrpc: "2.0",
    id: "dontcare",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "final",
      account_id: CONTRACT_ID,
      method_name: "get_proposal",
      args_base64:  Buffer.from(JSON.stringify({ "proposal_id": Number(proposal_id) })).toString('base64')
    }
  })

  console.log({body});

  const response = await fetch("https://rpc.mainnet.near.org", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
  });

  const data = await response.json();
  let deserializedResult;

  if (Array.isArray(data.result.result)) {
    deserializedResult = String.fromCharCode(...data.result.result);
  } else {
    deserializedResult = data.result.result;
  }

  return res.json(deserializedResult);
});

app.get('/.well-known/ai-plugin.json', (req: Request, res: Response) => {
  let bitteDevJson: { url?: string; };
  try {
    bitteDevJson = require("./bitte.dev.json");
  } catch (error) {
    console.warn("Failed to import bitte.dev.json, using default values");
    bitteDevJson = { url: undefined };
  }

  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Devhub NEAR Protocol API",
      description: "API for interacting with Devhub operations including creating, updating and submitting proposals.",
      version: "1.0.0"
    },
    servers: [
      {
        url: bitteDevJson.url || "http://localhost:8080"
      }
    ],
    "x-mb": {
      "account-id": "thomasguntenaar.near",
      "assistant": {
        "name": "Devhub Assistant",
        "description": "An assistant designed to interact with the devhub.near contract on the Near Protocol.",
        "instructions": "You are an assistant designed to interact with the devhub.near contract on the Near Protocol. Your main functions are:\n\n1. [List all write functions]: Use the /api/[function_name] endpoints to perform write operations. These endpoints will return valid function calls which you should be able to send. Ensure all required parameters are provided by the user as described in the paths section below.\n\n2. [List all view functions]: Use the /api/[function_name] endpoints to retrieve data from the contract.\n\nWhen performing write operations:\n- Ensure all required parameters are non-empty and of the correct type.\n- Avoid using any special characters or formatting that might cause issues with the contract.\n- If the user provides invalid input, kindly ask them to provide valid data according to the parameter specifications.\n\nWhen performing view operations:\n- Simply use the appropriate /api/[function_name] endpoint and return the result to the user.\n\nImportant: For all write operations, the endpoints will return a function call object. You should clearly indicate to the user that this is a function call that needs to be sent to the blockchain, and not the final result of the operation.",
        "tools": [{
          "type": "generate-transaction"
        }]
      }
    },
    paths: {
      "/api/add_member": {
        post: {
          tags: ["Member"],
          summary: "Add a new member",
          description: "This endpoint adds a new member to the community.",
          operationId: "add-member",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    member: { type: "object" },
                    metadata: { type: "object" }
                  },
                  required: ["member", "metadata"]
                }
              }
            },
            
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/add_proposal": {
        post: {
          tags: ["Proposal"],
          summary: "Add a new proposal",
          description: "This endpoint adds a new proposal to the community.",
          operationId: "add-proposal",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    body: { type: "object" },
                    labels: { type: "array", items: { type: "string" } },
                    // NOTE: it is the blockheight of the terms and conditions and optional
                    accepted_terms_and_conditions_version: { type: "integer" } 
                  },
                  // NOTE: removed "accepted_terms_and_conditions_version" from required
                  required: ["body", "labels"]
                }
              }
            },
          
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/add_rfp": {
        post: {
          tags: ["RFP"],
          summary: "Add a new RFP",
          description: "This endpoint adds a new RFP to the community.",
          operationId: "add-rfp",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    body: { type: "object" },
                    labels: { type: "array", items: { type: "string" } }
                  },
                  required: ["body", "labels"]
                }
              }
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/cancel_rfp": {
        post: {
          tags: ["RFP"],
          summary: "Cancel an RFP",
          description: "This endpoint cancels an existing RFP.",
          operationId: "cancel-rfp",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    proposals_to_cancel: { type: "array", items: { type: "number" } },
                    proposals_to_unlink: { type: "array", items: { type: "number" } }
                  },
                  required: ["id", "proposals_to_cancel", "proposals_to_unlink"]
                }
              }
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/create_community": {
        post: {
          tags: ["Community"],
          summary: "Create a new community",
          description: "This endpoint creates a new community.",
          operationId: "create-community",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    inputs: { type: "object" }
                  },
                  required: ["inputs"]
                }
              }
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/edit_member": {
        post: {
          tags: ["Member"],
          summary: "Edit an existing member",
          description: "This endpoint edits an existing member in the community.",
          operationId: "edit-member",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    member: { type: "object" },
                    metadata: { type: "object" }
                  },
                  required: ["member", "metadata"]
                }
              }
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/edit_proposal": {
        post: {
          tags: ["Proposal"],
          summary: "Edit an existing proposal",
          description: "This endpoint edits an existing proposal in the community.",
          operationId: "edit-proposal",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    body: { type: "object" },
                    labels: { type: "array", items: { type: "string" } }
                  },
                  required: ["id", "body", "labels"]
                }
              }
            },
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      params: {
                        type: "object",
                        properties: {
                          methodName: { type: "string" },
                          args: { type: "object" },
                          gas: { type: "string" },
                          deposit: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/get_community": {
        get: {
          tags: ["Community"],
          summary: "Get community details",
          description: "This endpoint retrieves details of a community.",
          operationId: "get-community",
          parameters: [
            {
              name: "handle",
              in: "query",
              required: true,
              schema: {
                type: "string"
              }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object"
                  }
                }
              }
            }
          }
        }
      },
      "/api/get_proposal": {
        get: {
          tags: ["Proposal"],
          summary: "Get proposal details",
          description: "This endpoint retrieves details of a proposal.",
          operationId: "get-proposal",
          parameters: [
            {
              name: "proposal_id",
              in: "query",
              required: true,
              schema: {
                type: "number"
              }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object"
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  res.json(openApiSpec);
});

app.get('/api/ping', (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});