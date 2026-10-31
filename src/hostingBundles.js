// ESN hosting bundles with their live Stripe Payment Links (monthly and yearly).
// Servers are created automatically after payment; the Community Pack's Discord server setup is done by ESN staff.
export const HOSTING_BUNDLES = [
  {
    "name": "Bot Duo",
    "detail": "Basic Bot + Micro Bot",
    "includes": [
      "ESN Basic (Discord bot server)",
      "ESN Micro (Discord bot server)"
    ],
    "monthly": "1.39",
    "yearly": "13.90",
    "separate": "1.64",
    "monthlyLink": "https://buy.stripe.com/6oU9AU05d6Af3oX6u3dnX38",
    "yearlyLink": "https://buy.stripe.com/bJe9AU05d7Eje3B8CbdnX39",
    "setup": null
  },
  {
    "name": "Bot + Web",
    "detail": "Basic Bot + Web 1GB",
    "includes": [
      "ESN Basic (Discord bot server)",
      "ESN Web (website/app server)"
    ],
    "monthly": "1.89",
    "yearly": "18.90",
    "separate": "2.18",
    "monthlyLink": "https://buy.stripe.com/28EbJ25px7Ej4t1cSrdnX3a",
    "yearlyLink": "https://buy.stripe.com/3cIdRadW31fV4t1g4DdnX3b",
    "setup": null
  },
  {
    "name": "Bot + Minecraft Plus",
    "detail": "Starter Bot + Pro Minecraft",
    "includes": [
      "ESN Starter (Discord bot server)",
      "ESN Pro (Minecraft server)"
    ],
    "monthly": "2.95",
    "yearly": "29.50",
    "separate": "3.24",
    "monthlyLink": "https://buy.stripe.com/6oU7sM4ltcYD2kT9GfdnX3c",
    "yearlyLink": "https://buy.stripe.com/bJeeVe8BJ7Ej8Jh2dNdnX3d",
    "setup": null
  },
  {
    "name": "Dev Team Pack",
    "detail": "3x Plus servers",
    "includes": [
      "ESN Plus (bot or Minecraft server)",
      "ESN Plus (bot or Minecraft server)",
      "ESN Plus (bot or Minecraft server)"
    ],
    "monthly": "3.29",
    "yearly": "32.90",
    "separate": "3.87",
    "monthlyLink": "https://buy.stripe.com/3cIbJ22dl1fV0cLaKjdnX3e",
    "yearlyLink": "https://buy.stripe.com/aFaeVeaJRaQvbVt3hRdnX3f",
    "setup": null
  },
  {
    "name": "Community Pack",
    "detail": "Basic Bot + Elite Minecraft + Discord Server Setup",
    "includes": [
      "ESN Basic (Discord bot server)",
      "ESN Elite (Minecraft server)",
      "+ $19 one-time Discord Server Setup, done by ESN staff (they contact you after purchase)"
    ],
    "monthly": "5.19",
    "yearly": "51.90",
    "separate": "5.48",
    "monthlyLink": "https://buy.stripe.com/eVq6oI4lte2H7Fd7y7dnX3g",
    "yearlyLink": "https://buy.stripe.com/28E7sM3hp2jZe3BbOndnX3h",
    "setup": "19.00"
  }
]

// Bot + Minecraft bundles (monthly). Savings are against today's separate plan prices.
export const BOT_MC_BUNDLES = [
  {
    "name": "Nano Bot + Advanced Minecraft",
    "monthly": "1.99",
    "separate": "2.29",
    "saving": "13%",
    "monthlyLink": "https://buy.stripe.com/eVqdRa7xF7Ej9Nl3hRdnW0K"
  },
  {
    "name": "Basic Bot + Elite Minecraft",
    "monthly": "4.78",
    "separate": "5.48",
    "saving": "13%",
    "monthlyLink": "https://buy.stripe.com/00w7sM8BJ7Ejf7F9GfdnW0L"
  },
  {
    "name": "Plus Bot + Extreme Minecraft",
    "monthly": "8.38",
    "separate": "9.28",
    "saving": "10%",
    "monthlyLink": "https://buy.stripe.com/fZu4gAf078In4t15pZdnW0M"
  }
]
