import Principal "mo:base/Principal";
import Result "mo:base/Result";
import McpTypes "mo:mcp-motoko-sdk/mcp/Types";
import Json "mo:json";

module ToolContext {

  /// Context shared between tools and the main canister
  /// This contains all the state and configuration that tools need to access
  public type ToolContext = {
    /// The principal of the canister
    canisterPrincipal : Principal;
    /// The owner of the canister
    owner : Principal;
    /// The application context from the MCP SDK
    appContext : McpTypes.AppContext;
  };

  /// Helper function to create an error response
  public func makeError(message : Text, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) {
    cb(#ok({ content = [#text({ text = "Error: " # message })]; isError = true; structuredContent = null }));
  };

  /// Helper function to create a success response with structured JSON
  public func makeSuccess(structured : Json.Json, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) {
    cb(#ok({ content = [#text({ text = Json.stringify(structured, null) })]; isError = false; structuredContent = ?structured }));
  };

  /// Helper function to create a success response with plain text
  public func makeTextSuccess(text : Text, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) {
    cb(#ok({ content = [#text({ text = text })]; isError = false; structuredContent = null }));
  };
};
