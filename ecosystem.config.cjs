module.exports = {
  apps: [
    {
      name: 'github-telegram-bot',
      script: './dist/index.js', // Path to your compiled JS
      env: {
        NODE_ENV: 'production',
      },
      // Restarts the bot if it crashes
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
    },
    {
      name: 'ngrok-tunnel',
      // We run ngrok through a shell command
      script: 'bash',
      args: "-c 'ngrok http 3300'",
      autorestart: true,
      // Prevents infinite restart loops if ngrok has an auth error
      restart_delay: 5000,
    },
  ],
};
