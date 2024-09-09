import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ProposalSystemModule = buildModule("ProposalSystemModule", (m) => {
  const governanceTokenContract = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const proposalSystem = m.contract("ProposalSystem", [governanceTokenContract])

  return { proposalSystem };
});

export default ProposalSystemModule;