using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Ecommerce.Api.Services;
using Ecommerce.Application.Common.Models;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Server;

namespace Ecommerce.Api.Controllers;

[Authorize(Roles = "Admin")]
public class AdminChatController : BaseApiController
{
    private readonly IChatClient _chatClient;
    private readonly McpToolService _toolService;
    private readonly ILogger<AdminChatController> _logger;

    public AdminChatController(
        IChatClient chatClient,
        McpToolService toolService,
        ILogger<AdminChatController> logger)
    {
        _chatClient = chatClient;
        _toolService = toolService;
        _logger = logger;
    }

    public class ChatRequest
    {
        [Required]
        public string Message { get; set; } = string.Empty;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<ApiResponse<object>>> Chat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var availableTools = _toolService.GetAvailableTools();

            var messages = new List<ChatMessage>
            {
                new ChatMessage(ChatRole.System,
                    "You are the NexStore admin assistant. Answer questions about sales, inventory, and orders using the provided tools. " +
                    "Currency is BDT. Be concise and helpful. Always use tools to get real-time data. " +
                    "Available tools: " + string.Join(", ", availableTools)),
                new ChatMessage(ChatRole.User, request.Message)
            };

            var toolCalls = new List<string>();
            string finalAnswer = string.Empty;

            // Tool-calling loop: call LLM up to 5 times to handle tool invocations
            for (int i = 0; i < 5; i++)
            {
                var response = await _chatClient.GetResponseAsync(
                    messages,
                    cancellationToken: cancellationToken);

                var assistantMessage = response.Messages.LastOrDefault();
                if (assistantMessage == null) break;

                messages.Add(assistantMessage);

                var functionCalls = assistantMessage.Contents!
                    .OfType<FunctionCallContent>()
                    .ToList();

                if (functionCalls.Count == 0)
                {
                    finalAnswer = assistantMessage.Text ?? "I couldn't generate an answer.";
                    break;
                }

                foreach (var call in functionCalls)
                {
                    toolCalls.Add(call.Name);
                    _logger.LogInformation("Executing tool: {ToolName}", call.Name);

                    var arguments = new Dictionary<string, object>();
                    foreach (var kvp in call.Arguments)
                    {
                        arguments[kvp.Key] = kvp.Value ?? string.Empty;
                    }

                    var toolResult = await _toolService.ExecuteToolAsync(call.Name, arguments);
                    messages.Add(new ChatMessage(ChatRole.Tool, toolResult));
                }
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Chat response generated",
                Data = new { answer = finalAnswer, toolCalls }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in admin chat");
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Failed to generate chat response",
                Errors = new List<string> { ex.Message }
            });
        }
    }
}
