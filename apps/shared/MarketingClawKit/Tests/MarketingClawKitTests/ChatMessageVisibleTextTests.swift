import Foundation
import Testing
@testable import MarketingClawChatUI

private func textContent(_ text: String) -> MarketingClawChatMessageContent {
    MarketingClawChatMessageContent(type: "text", text: text, mimeType: nil, fileName: nil, content: nil)
}

private func toolCallContent(name: String) -> MarketingClawChatMessageContent {
    MarketingClawChatMessageContent(
        type: "toolCall",
        text: nil,
        mimeType: nil,
        fileName: nil,
        content: nil,
        id: "call-1",
        name: name)
}

@Suite("ChatMessageVisibleText")
struct ChatMessageVisibleTextTests {
    @Test func `assistant visible text skips non text blocks`() {
        let message = MarketingClawChatMessage(
            role: "assistant",
            content: [
                textContent("Here is the answer."),
                toolCallContent(name: "exec"),
                textContent("And a follow-up."),
            ],
            timestamp: 1)

        #expect(ChatMessageVisibleText.visibleText(in: message)
            == "Here is the answer.\nAnd a follow-up.")
    }

    @Test func `user text passes through without assistant parsing`() {
        let message = MarketingClawChatMessage(
            role: "user",
            content: [textContent("What is <final>up</final>?")],
            timestamp: 1)

        #expect(ChatMessageVisibleText.visibleText(in: message) == "What is <final>up</final>?")
    }

    @Test func `has visible text ignores tool blank and thinking only messages`() {
        let toolOnly = MarketingClawChatMessage(
            role: "assistant",
            content: [toolCallContent(name: "exec")],
            timestamp: 1)
        let blank = MarketingClawChatMessage(
            role: "assistant",
            content: [textContent("   ")],
            timestamp: 1)
        let spoken = MarketingClawChatMessage(
            role: "assistant",
            content: [textContent("Say this")],
            timestamp: 1)
        let thinkingOnly = MarketingClawChatMessage(
            role: "assistant",
            content: [textContent("<think>Do not speak this</think>")],
            timestamp: 1)

        #expect(!ChatMessageVisibleText.hasVisibleText(in: toolOnly))
        #expect(!ChatMessageVisibleText.hasVisibleText(in: blank))
        #expect(!ChatMessageVisibleText.hasVisibleText(in: thinkingOnly))
        #expect(ChatMessageVisibleText.hasVisibleText(in: spoken))
    }
}
