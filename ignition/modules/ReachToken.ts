import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ReachTokenModule = buildModule("ReachTokenModule", (m) => {
  const initialSupply = 1_000_000;
  const reachToken = m.contract("ReachToken", [initialSupply]);

  return { reachToken };
});

export default ReachTokenModule;