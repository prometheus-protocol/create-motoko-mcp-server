import McpTypes "mo:mcp-motoko-sdk/mcp/Types";
import AuthTypes "mo:mcp-motoko-sdk/auth/Types";
import Result "mo:base/Result";
import Json "mo:json";

import ToolContext "ToolContext";

module {

  /// Tool configuration for get_weather
  public func config() : McpTypes.Tool = {
    name = "get_weather";
    title = ?"Weather Provider";
    description = ?"Get current weather information for a location";
    payment = null; // No payment required, this tool is free to use.
    inputSchema = Json.obj([
      ("type", Json.str("object")),
      ("properties", Json.obj([
        ("location", Json.obj([
          ("type", Json.str("string")),
          ("description", Json.str("City name or zip code"))
        ]))
      ])),
      ("required", Json.arr([Json.str("location")])),
    ]);
    outputSchema = ?Json.obj([
      ("type", Json.str("object")),
      ("properties", Json.obj([
        ("report", Json.obj([
          ("type", Json.str("string")),
          ("description", Json.str("The textual weather report."))
        ]))
      ])),
      ("required", Json.arr([Json.str("report")])),
    ]);
  };

  /// Tool handler function
  /// Returns a function that takes args, auth, and a callback
  public func handle(_context : ToolContext.ToolContext) : (
    _args : McpTypes.JsonValue,
    _auth : ?AuthTypes.AuthInfo,
    cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()
  ) -> async () {
    func(_args : McpTypes.JsonValue, _auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
      
      // Parse the location argument
      let location = switch (Result.toOption(Json.getAsText(_args, "location"))) {
        case (?loc) { loc };
        case (null) {
          return ToolContext.makeError("Missing 'location' argument", cb);
        };
      };

      // Generate the weather report
      let report = "The weather in " # location # " is sunny.";

      // Build the structured JSON payload that matches our outputSchema
      let structuredPayload = Json.obj([
        ("report", Json.str(report))
      ]);

      // Return the success response
      ToolContext.makeSuccess(structuredPayload, cb);
    };
  };
};
