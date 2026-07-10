import Foundation
import Testing
@testable import MarketingClaw

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["marketingclaw.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let marketingclawPath = tmp.appendingPathComponent("node_modules/.bin/marketingclaw")
            try makeExecutableForTests(at: marketingclawPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [marketingclawPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [marketingclawPath.path, "node", "stop", "--json"])
        }
    }
}
