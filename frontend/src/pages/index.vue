<template>
  <div>
    <div text-4xl inline-block>👋🏻</div>
    <p>
      <a
        rel="noreferrer"
        href="https://github.com/antfu/vitesse-lite"
        target="_blank"
      >Отправь свое сообщение напрямую в Blockchain</a>
    </p>
    <p>
      <em text-sm op75>
        Отправь
        <a class="text-purple-600" href="instagram.com/insuline.ru">мне</a>
        текстовое сообщение с карьерным советом, а то я не могу определиться.
        <br />С шансом в 20% – я верну тебе стоимость отправки твоего сообщения на твой ETH адрес
      </em>
    </p>

    <div py-4 />

    <input
      id="input"
      v-model="message"
      placeholder="Что посоветуешь?"
      type="text"
      autocomplete="false"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
    />

    <div>
      <button
        class="m-3 text-sm btn"
        :disabled="!message || isSending"
        @click="wave"
      >{{ isSending ? 'Отправка' : 'Отправить' }}</button>
    </div>

    <div v-if="!currentAccount">
      <button class="m-3 text-sm btn" @click="connectWallet">Войти через MetaMask</button>
    </div>

    <div class="flex flex-col" v-if="allWaves.length > 0">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Отправитель</th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Сообщение</th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Дата отправки</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(wave, index) in allWaves" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">{{ wave.waver }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ wave.message }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ wave.timestamp.toLocaleString() }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Разобраться web3.js + typescript и вернуть тайпскрипт
import abi from '~/utils/wavePortal.json'
import { ethers } from 'ethers'

interface IWave {
  waver: string,
  timestamp: number | Date,
  message: string
}

const message = ref('')
const isSending = ref(false)
const currentAccount = ref(null)
const allWaves = ref<IWave[]>([])
const totalWaves = ref<number | null>(null)

const CONTRACT_ADDRESS = "0x718520b88B92cB25577C6e839380388e0dA04DB3"
const CONTRACT_ABI = abi.abi

const checkIfWalletIsConnected = async () => {
  try {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } else {
      console.log("We have the ethereum object", ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account)
      currentAccount.value = account
      getAllWaves()
    } else {
      console.log("No authorized account found")
    }
  } catch (error) {
    console.log(error)
  }
}

const connectWallet = async () => {
  try {
    const { ethereum } = window

    if (!ethereum) {
      alert("Get MetaMask!")
      return
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" })

    console.log("Connected", accounts[0])
    currentAccount.value = accounts[0]

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    let count = await wavePortalContract.getTotalWaves()
    totalWaves.value = count.toNumber()
  } catch (error) {
    console.log(error)
  }
}

const wave = async () => {
  try {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      let count = await wavePortalContract.getTotalWaves()
      totalWaves.value = count.toNumber()
      console.log("Retrieved total wave count...", count.toNumber())

      isSending.value = true
      const waveTxn = await wavePortalContract.wave(message.value)
      console.log("Mining...", waveTxn.hash)

      message.value = ''
      await waveTxn.wait()
      console.log("Mined -- ", waveTxn.hash)
      isSending.value = false

      count = await wavePortalContract.getTotalWaves()
      totalWaves.value = count.toNumber()
      console.log("Retrieved total wave count...", count.toNumber())
      getAllWaves()

    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log(error)
  }
}

const getAllWaves = async () => {
  try {
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)


      const waves = await wavePortalContract.getAllWaves()
      const wavesCleaned: IWave[] = waves.map((wave: { waver: string, timestamp: number, message: string }) => {
        return {
          waver: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        }
      })

      allWaves.value = wavesCleaned.reverse()
    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  checkIfWalletIsConnected()
})
</script>
