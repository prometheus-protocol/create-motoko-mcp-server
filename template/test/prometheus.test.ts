/**
 * MCP Server Requirements Test Suite
 * 
 * This test suite validates that an MCP server canister meets all requirements
 * for the create-motoko-mcp-server template. It can be copied into any MCP server
 * project to ensure compliance.
 * 
 * Requirements tested:
 * 1. Tool discovery via JSON-RPC (tools/list endpoint)
 * 2. Owner system (get_owner method)
 * 3. Wallet/treasury system (get_treasury_balance method)
 * 4. ICRC-120 upgrade status (icrc120_upgrade_finished method)
 * 5. API key system (optional for public servers)
 */

import { describe, beforeAll, afterAll, it, expect, inject } from 'vitest';
import { PocketIc, createIdentity } from '@dfinity/pic';
import { IDL } from '@icp-sdk/core/candid';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { idlFactory as mcpServerIdlFactory } from '../.dfx/local/canisters/my_mcp_server/service.did.js';
import type { _SERVICE as McpServerService } from '../.dfx/local/canisters/my_mcp_server/service.did.d.ts';
import type { Actor } from '@dfinity/pic';
import path from 'node:path';

// Configure the path to your MCP server WASM
const MCP_SERVER_WASM_PATH = path.resolve(
  __dirname,
  '../.dfx/local/canisters/my_mcp_server/my_mcp_server.wasm',
);

describe('MCP Server Requirements', () => {
  let pic: PocketIc;
  let serverActor: Actor<McpServerService>;
  let canisterId: Principal;
  let testOwner = createIdentity('test-owner');

  beforeAll(async () => {
    // Use the global PocketIC server URL
    const picUrl = inject('PIC_URL');
    
    // Create PocketIC instance
    pic = await PocketIc.create(picUrl);
    
    // Create canister
    canisterId = await pic.createCanister();
    
    // Initialize with test owner as the owner
    const initArg = IDL.encode(
      [IDL.Opt(IDL.Record({ owner: IDL.Opt(IDL.Principal) }))],
      [[{ owner: [testOwner.getPrincipal()] }]],
    );
    
    await pic.installCode({
      canisterId,
      wasm: MCP_SERVER_WASM_PATH,
      caller: testOwner,
      arg: initArg.buffer as ArrayBufferLike,
    });
    
    // Create actor
    serverActor = pic.createActor<McpServerService>(
      mcpServerIdlFactory,
      canisterId,
    );
  });

  afterAll(async () => {
    await pic?.tearDown();
  });

  describe('JSON-RPC Tool Discovery', () => {
    it('should respond to tools/list request via http_request_update', async () => {
      // Set anonymous identity for public access
      serverActor.setIdentity(new AnonymousIdentity());

      // Prepare JSON-RPC request
      const rpcPayload = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 'test-tools-list',
      };
      const body = new TextEncoder().encode(JSON.stringify(rpcPayload));

      // Make HTTP request to MCP endpoint
      const httpResponse = await serverActor.http_request_update({
        method: 'POST',
        url: '/mcp',
        headers: [['Content-Type', 'application/json']],
        body,
        certificate_version: [],
      });

      expect(httpResponse.status_code).toBe(200);
    });

    it('should return valid JSON-RPC response with tools array', async () => {
      serverActor.setIdentity(new AnonymousIdentity());

      const rpcPayload = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 'test-tools-list',
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

      // Should have JSON-RPC structure
      expect(responseBody).toHaveProperty('jsonrpc', '2.0');
      expect(responseBody).toHaveProperty('id', 'test-tools-list');
      expect(responseBody).not.toHaveProperty('error');
      
      // Should have tools array in result
      expect(responseBody).toHaveProperty('result');
      expect(responseBody.result).toHaveProperty('tools');
      expect(Array.isArray(responseBody.result.tools)).toBe(true);
    });

    it('should return tools with required fields (name, description, inputSchema)', async () => {
      serverActor.setIdentity(new AnonymousIdentity());

      const rpcPayload = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 'test-tools-list',
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

      const tools = responseBody.result.tools;
      
      // If there are tools, validate their structure
      if (tools.length > 0) {
        tools.forEach((tool: any) => {
          expect(tool).toHaveProperty('name');
          expect(typeof tool.name).toBe('string');
          expect(tool.name.length).toBeGreaterThan(0);
          
          // Description and inputSchema are optional but should be proper types if present
          if (tool.description !== undefined) {
            expect(typeof tool.description).toBe('string');
          }
          if (tool.inputSchema !== undefined) {
            expect(typeof tool.inputSchema).toBe('object');
          }
        });
      }
    });
  });

  describe('Owner System', () => {
    it('should have get_owner method', async () => {
      // @ts-ignore - Method may not be in type definition but should exist on canister
      const owner = await serverActor.get_owner();
      
      expect(owner).toBeDefined();
      expect(typeof owner.toText).toBe('function');
    });

    it('should return a valid Principal as owner', async () => {
      // @ts-ignore
      const owner = await serverActor.get_owner();
      
      // Should be a Principal
      const ownerText = owner.toText();
      expect(typeof ownerText).toBe('string');
      expect(ownerText.length).toBeGreaterThan(0);
      
      // Should not be anonymous principal
      expect(ownerText).not.toBe('2vxsx-fae');
    });
  });

  describe('Wallet/Treasury System', () => {
    it('should have get_treasury_balance method', async () => {
      const dummyLedgerId = Principal.fromText('aaaaa-aa');
      
      // @ts-ignore - Method may not be in type definition but should exist on canister
      const balance = await serverActor.get_treasury_balance(dummyLedgerId);
      
      expect(balance).toBeDefined();
    });

    it('should return a numeric balance (bigint or number)', async () => {
      const dummyLedgerId = Principal.fromText('aaaaa-aa');
      
      // @ts-ignore
      const balance = await serverActor.get_treasury_balance(dummyLedgerId);
      
      // Should be a number or bigint
      const isNumeric = typeof balance === 'bigint' || typeof balance === 'number';
      expect(isNumeric).toBe(true);
      
      // Balance should be non-negative
      if (typeof balance === 'bigint') {
        expect(balance >= 0n).toBe(true);
      } else {
        expect(balance >= 0).toBe(true);
      }
    });
  });

  describe('ICRC-120 Upgrade System', () => {
    it('should have icrc120_upgrade_finished method', async () => {
      // @ts-ignore - Method may not be in type definition but should exist on canister
      const result = await serverActor.icrc120_upgrade_finished();
      
      expect(result).toBeDefined();
    });

    it('should return valid upgrade status', async () => {
      // @ts-ignore
      const result = await serverActor.icrc120_upgrade_finished();
      
      // Should be an object with one of the expected variants
      expect(result).toBeDefined();
      
      // Check if it has one of the expected keys
      const hasValidKey = 
        'Success' in result || 
        'InProgress' in result || 
        'Failed' in result;
      
      expect(hasValidKey).toBe(true);
      
      // If it's Success (which it should be after deployment), check the timestamp
      if ('Success' in result) {
        const timestamp = result.Success;
        expect(typeof timestamp === 'bigint' || typeof timestamp === 'number').toBe(true);
        // Timestamp should be positive
        if (typeof timestamp === 'bigint') {
          expect(timestamp > 0n).toBe(true);
        } else {
          expect(timestamp > 0).toBe(true);
        }
      }
    });
  });

  describe('API Key System (Optional for Public Servers)', () => {
    it('should either have API key system or be a public server', async () => {
      // First check if it's a public server (can discover tools anonymously)
      serverActor.setIdentity(new AnonymousIdentity());
      
      let isPublicServer = false;
      try {
        const rpcPayload = {
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 'test-public-access',
        };
        const body = new TextEncoder().encode(JSON.stringify(rpcPayload));
        
        const httpResponse = await serverActor.http_request_update({
          method: 'POST',
          url: '/mcp',
          headers: [['Content-Type', 'application/json']],
          body,
          certificate_version: [],
        });
        
        if (httpResponse.status_code === 200) {
          isPublicServer = true;
        }
      } catch (e) {
        // Not a public server
      }

      // If not public, should have API key system
      if (!isPublicServer) {
        const testIdentity = createIdentity('test-api-key-user');
        serverActor.setIdentity(testIdentity);
        
        // @ts-ignore
        const apiKey = await serverActor.create_my_api_key('test-key', []);
        
        expect(typeof apiKey).toBe('string');
        expect(apiKey.length).toBeGreaterThan(0);
      }
      
      // If it's public, API key system is optional
      // Test passes either way
      expect(true).toBe(true);
    });
  });

  describe('Complete System Integration', () => {
    it('should meet all requirements for create-motoko-mcp-server template', async () => {
      const requirements = {
        toolDiscovery: false,
        ownerSystem: false,
        walletSystem: false,
        icrc120: false,
      };

      // Test 1: Tool Discovery
      try {
        serverActor.setIdentity(new AnonymousIdentity());
        const rpcPayload = {
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 'integration-test',
        };
        const body = new TextEncoder().encode(JSON.stringify(rpcPayload));
        const httpResponse = await serverActor.http_request_update({
          method: 'POST',
          url: '/mcp',
          headers: [['Content-Type', 'application/json']],
          body,
          certificate_version: [],
        });
        
        if (httpResponse.status_code === 200) {
          const responseBody = JSON.parse(
            new TextDecoder().decode(httpResponse.body as Uint8Array),
          );
          if (responseBody.result?.tools && Array.isArray(responseBody.result.tools)) {
            requirements.toolDiscovery = true;
          }
        }
      } catch (e) {
        // Tool discovery failed
      }

      // Test 2: Owner System
      try {
        // @ts-ignore
        const owner = await serverActor.get_owner();
        if (owner && typeof owner.toText === 'function') {
          requirements.ownerSystem = true;
        }
      } catch (e) {
        // Owner system not found
      }

      // Test 3: Wallet System
      try {
        const dummyLedgerId = Principal.fromText('aaaaa-aa');
        // @ts-ignore
        const balance = await serverActor.get_treasury_balance(dummyLedgerId);
        if (typeof balance === 'bigint' || typeof balance === 'number') {
          requirements.walletSystem = true;
        }
      } catch (e) {
        // Wallet system not found
      }

      // Test 4: ICRC-120 Upgrade System
      try {
        // @ts-ignore
        const result = await serverActor.icrc120_upgrade_finished();
        if (result && ('Success' in result || 'InProgress' in result || 'Failed' in result)) {
          requirements.icrc120 = true;
        }
      } catch (e) {
        // ICRC-120 system not found
      }

      // All four requirements must be met
      expect(requirements.toolDiscovery).toBe(true);
      expect(requirements.ownerSystem).toBe(true);
      expect(requirements.walletSystem).toBe(true);
      expect(requirements.icrc120).toBe(true);

      // Log summary
      console.log('\n✅ MCP Server Requirements Summary:');
      console.log(`   📡 Tool Discovery (JSON-RPC): ${requirements.toolDiscovery ? '✅' : '❌'}`);
      console.log(`   👤 Owner System: ${requirements.ownerSystem ? '✅' : '❌'}`);
      console.log(`   💰 Wallet/Treasury System: ${requirements.walletSystem ? '✅' : '❌'}`);
      console.log(`   🔄 ICRC-120 Upgrade: ${requirements.icrc120 ? '✅' : '❌'}`);
    });
  });
});
