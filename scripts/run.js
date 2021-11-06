const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();

  console.log("Contract deployed to:", waveContract.address);
  console.log("Contract deployed by:", owner.address);

  let waveCount;
  let waveSendersCount;

  waveCount = await waveContract.getTotalWaves();
  waveSendersCount = await waveContract.getWaveSendersCount();

  let waveTransaction = await waveContract.wave();
  await waveTransaction.wait();

  waveCount = await waveContract.getTotalWaves();
  waveSendersCount = await waveContract.getWaveSendersCount();

  waveTransaction = await waveContract.wave();
  await waveTransaction.wait();

  waveCount = await waveContract.getTotalWaves();
  waveSendersCount = await waveContract.getWaveSendersCount();

  waveTransaction = await waveContract.connect(randomPerson).wave();
  await waveTransaction.wait();

  waveCount = await waveContract.getTotalWaves();
  waveSendersCount = await waveContract.getWaveSendersCount();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
