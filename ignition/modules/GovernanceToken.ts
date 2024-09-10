import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const GovernanceTokenModule = buildModule("GovernanceTokenModule", (m) => {
  const initialSupply = 1_000_000;
  const reachToken = m.contract("GovernanceToken", [initialSupply]);

  return { reachToken };
});

export default GovernanceTokenModule;