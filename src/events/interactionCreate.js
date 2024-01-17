let hastebin = require('hastebin');
// let Telegram = require('telegrambot');
// let api = new Telegram('<TOKEN_TELEGRAM>')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Вы уже создали тикет!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`тикет-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Тикет создан! <#${c.id}>`,
          ephemeral: true
        });

        // api.invoke('sendMessage', { chat_id: "id", text: 'Внимание был создан тикет в Дискорде, пожалуйста скорее дайте ответ на него!'}, function (err, message) {
        //   if (err) throw err;
        //   console.log(message);
        // })

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('Тикет', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
          .setDescription('Выберите категорию своего тикета')
          .setFooter('DailyFire.RU', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Выберите категорию тикета')
            .addOptions([{
                label: 'Жалобы на игрока',
                value: 'Жалобы на игроков',
                emoji: '👥',
              },
              {
                label: 'Жалобы на администратора',
                value: 'Жалобы на Администратора',
                emoji: '👤',
              },
              {
                label: 'Техническая поддержка',
                value: 'Тех.Поддержка',
                emoji: '🚨',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Тикет', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
                  .setDescription(`<@!${interaction.user.id}> Создал тикет ${i.values[0]}`)
                  .setFooter('DailyFire.RU', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Закрыть тикет')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'Жалобы на игроков') {
              c.edit({
                parent: client.config.parentTransactions
              });
            };
            if (i.values[0] == 'Тех.Поддержка') {
              c.edit({
                parent: client.config.parentJeux
              });
            };
            if (i.values[0] == 'Жалобы на Администратора') {
              c.edit({
                parent: client.config.parentAutres
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Нет выбранной категории. Закрытие тикета...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Закрыть тикет')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Отмена закрытия')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Вы уверены ,что хотите закрыть тикет?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `<@!${interaction.user.id}> закрыл тикет`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Тикет', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
                .setDescription('```Нужно ли удалить тикет?```')
                .setFooter('DailyFire.RU', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Удалить тикет')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Закрытие отмененного тикета!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Закрытие отмененного тикета!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Резервное копирование сообщений...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('ru-RU')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Ничего"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Лог Тикетов', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
              .setDescription(`📰 Зарегистрирован тикет \`${chan.id}\` созданный <@!${chan.topic}> и удалён <@!${interaction.user.id}>\n\nЛог: [**Нажмите здесь, чтобы просмотреть лог**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Лог Тикетов', 'https://sun9-8.userapi.com/impg/r8G2qfB1mf5M00YPHwhLmDwQVJukxK4NIqGTLw/q6OdPbqdmwQ.jpg?size=400x400&quality=95&sign=e2190615c2c654ff60b1981fb319c990&type=album')
              .setDescription(`📰 Лог вашего тикета \`${chan.id}\`: [**Нажмите здесь, чтобы просмотреть лог**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch();
            chan.send('Удаление канала...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};