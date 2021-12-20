module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('[DraimTickets] Бот успешно включен.')
    console.log('Благодарим за использование DraimTickets ❤️ by DraimGooSe');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setDescription('> Категории тикетов:')
        .addFields(
          { name: 'Жалобы на игроков', value: '```Если вы заметили нарушение правил сервера игроком, то выберите эту категорию```', inline: true },
          { name: 'Жалобы на Администрацию', value: '```Если вы не согласны с выданным Вам наказанием, то выберите эту категорию```', inline: true },
          { name: 'Техническая поддержка', value: '```Если вы заметили баг или у вас есть вопрос по технической состовляющей, то выберите эту категорию```', inline: true },
          { name: 'Для подачи Жалобы на Игроков/Администрацию или Связью с разработчиками', value: '**нажмите на кнопку ниже.**' },
        )
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Создать тикет')
          .setEmoji('✉️')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Ожидаемый канал, получено ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};
