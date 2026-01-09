# DoQuest

<p align="center">
  <a href="https://doquest.com/" target="_blank"><img src="./src/assests/assests.svg" width="120" alt="DoQuest Logo" /></a>
</p>

<p align="center">A dynamic platform built with <a href="http://nodejs.org" target="_blank">Node.js</a> and NestJS for connecting quest posters with skilled hunters to complete tasks, projects, and challenges for rewards.</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/furqanRupom/do-quest-backend" target="_blank"><img src="https://img.shields.io/circleci/build/github/furqanRupom/do-quest-backend/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/doquest" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://twitter.com/doquestplatform" target="_blank"><img src="https://img.shields.io/twitter/follow/doquestplatform.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Description

[DoQuest](https://github.com/furqanRupom/do-quest-backend) is a robust backend repository for the DoQuest platform, inspired by similar marketplaces like Bounty Quest. It serves as a thriving ecosystem where users can post quests (tasks or bounties), hunters can discover and complete them, and rewards are distributed seamlessly. Built on the NestJS framework, it provides efficient, scalable server-side architecture for handling user authentication, quest management, payments, and more.

Key features include:
- **Quest Posting and Hunting**: Users can create detailed quests with descriptions, requirements, and rewards. Hunters browse, apply, and complete tasks.
- **Reward System**: Secure handling of rewards, including cryptocurrency or fiat integrations (configurable).
- **User Profiles and Ratings**: Build reputation through completed quests, reviews, and ratings.
- **Secure Authentication**: Includes password reset flows, email notifications, and JWT-based sessions.
- **Real-time Updates**: WebSocket support for live notifications on quest status changes.
- **Admin Dashboard Tools**: Moderation features for managing quests and users.
- **Integration Ready**: APIs for frontend clients, mobile apps, and third-party services.

This starter repository provides the foundation for building and deploying your own quest-based marketplace.

## Project Setup

```bash
$ pnpm install
```

## Compile and Run the Project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run Tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Resources

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the underlying framework.
- For questions and support, join our [Discord channel](https://discord.gg/doquest).
- Dive deeper with official NestJS video [courses](https://courses.nestjs.com/).
- Deploy to AWS effortlessly using [NestJS Mau](https://mau.nestjs.com).
- Visualize your application with [NestJS Devtools](https://devtools.nestjs.com).
- Need enterprise support? Check out [NestJS Enterprise](https://enterprise.nestjs.com).
- Stay updated on [X (Twitter)](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Job opportunities? Visit the [NestJS Jobs board](https://jobs.nestjs.com).

## Support

DoQuest is an open-source project licensed under MIT. It thrives with community contributions and sponsorships. If you'd like to support development, please [learn more here](https://github.com/furqanRupom/do-quest-backend).

## Stay in Touch

- Author: [Furqan Rupom](https://github.com/furqanRupom)
- Website: [https://doquest.com](https://doquest.com/)
- Twitter: [@doquestplatform](https://twitter.com/doquestplatform)

## License

DoQuest is [MIT licensed](LICENSE).