import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token contract", function () {
	it("Deployment should assign the total supply of tokens to the owner", async function() {
		const [owner] = await ethers.getSigners();
		const Token = await ethers.getContractFactory("Token");
		const hardhatToken = await Token.deploy();
		const ownerBalance = await hardhatToken.balanceOf(owner.address);
		expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
	});
});

describe("Transactions", function() {
	it("Should transfer tokens between accounts", async function() {
		const [owner, addr1, addr2] = await ethers.getSigners();
		const Token = await ethers.getContractFactory("Token");

		const hardhatToken = await Token.deploy();

		// Transfer 50 tokens from owner to addr1.
		await hardhatToken.transfer(addr1.address, 50);
		expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);

		// Transfer 50 tokens from addr1 to addr2.
		await hardhatToken.connect(addr1).transfer(addr2.address, 50);
		expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
	});
});

describe("Token contract - 2", function() {
	let Token;
	let hardhatToken: Contract;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	let addrs: SignerWithAddress[];

	this.beforeEach(async function() {
		Token = await ethers.getContractFactory('Token');

		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		hardhatToken = await Token.deploy();
	});

	describe('Deployment', function() {
		it('Should set the right owner', async function() {
			expect(await hardhatToken.owner()).to.equal(owner.address);
		});

		it("Deployment should assign the total supply of tokens to the owner", async function() {
			const [owner] = await ethers.getSigners();
			const Token = await ethers.getContractFactory("Token");
			const hardhatToken = await Token.deploy();
			const ownerBalance = await hardhatToken.balanceOf(owner.address);
			expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
		});

		it("Should fail if sender doesn't have enough tokens", async function() {
			const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

			await expect(hardhatToken.connect(addr1).transfer(owner.address, 1))
				.to.be.revertedWith('Not enough tokens');

			// Owner balance shouldn't have changed.
			expect(await hardhatToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
		});

		it('Should update balances after transfers', async function() {
			const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

			// Transfer 100 tokens from owner to addr1.
			await hardhatToken.transfer(addr1.address, 100);

			// Transfer another 50 from owner to addr2.
			await hardhatToken.transfer(addr2.address, 50);

			// Check balance.
			const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

			const addr1Balance = await hardhatToken.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(100);

			const addr2Balance = await hardhatToken.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
	});
});
