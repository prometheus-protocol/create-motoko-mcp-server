/**
 * Tool-Specific Test Suite
 * 
 * This file contains tests for individual MCP tools.
 * Add tests here to validate the specific behavior of your custom tools.
 */

import { describe, beforeAll, afterAll, it, expect, inject } from 'vitest';
import { PocketIc, createIdentity } from '@dfinity/pic';
import { IDL } from '@icp-sdk/core/candid';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { idlFactory as mcpServerIdlFactory } from '../.dfx/local/canisters/my_mcp_server/service.did.js';
import type { _SERVICE as McpServerService } from '../.dfx/local/canisters/my_mcp_server/service.did.d.ts';
import type { Actor } from '@dfinity/pic';
import path from 'node:path';

const MCP_SERVER_WASM_PATH = path.resolve(
  __dirname,
  '../.dfx/local/canisters/my_mcp_server/my_mcp_server.wasm',
);

describe('Tool-Specific Tests', () => {
  let pic: PocketIc;
  let serverActor: Actor<McpServerService>;
  let canisterId: any;
  let testOwner = createIdentity('test-owner');

  beforeAll(async () => {
    // Use the global PocketIC server URL
    const picUrl = inject('PIC_URL');
    
    pic = await PocketIc.create(picUrl);
    canisterId = await pic.createCanister();
    
    const initArg = IDL.encode(
      [IDL.Opt(IDL.Record({ owner: IDL.Opt(IDL.Principal) }))],
      [[{ owner: [testOwner.getPrincipal()] }]],
    );
    
    await pic.installCode({
      canisterId,
      wasm: MCP_SERVER_WASM_PATH,
      arg: initArg.buffer as ArrayBufferLike,
    });
    
    serverActor = pic.createActor<McpServerService>(
      mcpServerIdlFactory,
      canisterId,
    );
  });

  afterAll(async () => {
    await pic?.tearDown();
  });

  describe('get_weather Tool', () => {
    it('should return weather for a valid location', async () => {
      serverActor.setIdentity(new AnonymousIdentity());

      const rpcPayload = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_weather',
          arguments: { location: 'New York' }
        },
        id: 'test-get-weather',
      };
      const body = new TextEncoder().encode(JSON.stringify(rpcPayload));

      const httpResponse = await serverActor.http_request_update({
        method: 'POST',
        url: '/mcp',
        headers: [['Content-Type', 'application/json']],
        body,
        certificate_version: [],
      });

      expect(httpResponse.status_code).toBe(200);
      
      const responseBody = JSON.parse(
        new TextDecoder().decode(httpResponse.body as Uint8Array),
      );

      expect(responseBody.result.content).toBeDefined();
      expect(responseBody.result.isError).toBe(false);
      
      // Verify the response contains weather information
      const resultText = responseBody.result.content[0].text;
      const parsedResult = JSON.parse(resultText);
      expect(parsedResult.report).toContain('New York');
      expect(parsedResult.report).toContain('weather');
    });

    it('should handle missing location parameter', async () => {
      serverActor.setIdentity(new AnonymousIdentity());

      const rpcPayload = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_weather',
          arguments: {} // Missing location
        },
        id: 'test-missing-param',
      };
      const body = new TextEncoder().encode(JSON.stringify(rpcPayload));

      const httpResponse = await serverActor.http_request_update({
        method: 'POST',
        url: '/mcp',
        headers: [['Content-Type', 'application/json']],
        body,
        certificate_version: [],
      });

      const responseBody = JSON.parse(
        new TextDecoder().decode(httpResponse.body as Uint8Array),
      );

      // Should return an error response
      expect(responseBody.result.isError).toBe(true);
      expect(responseBody.result.content[0].text).toContain('location');
    });
  });
});
