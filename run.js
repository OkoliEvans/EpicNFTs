const main = async () => {

  const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log('Nft contract deployed to:', nftContract.address);

  let txn = await nftContract.makeAnEpicNft();
  // wait for it to be mined
  await txn.wait();

  txn = await nftContract.makeAnEpicNft();
  await txn.wait();

};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  };
};

runMain();
// Contract address: 0x69f77055e9A6e6B34539Db2BD733f9eB07F9f11f
