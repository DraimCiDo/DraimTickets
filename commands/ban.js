const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Заблокировать участника')
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Участник которого вы хотите забанить')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
      .setDescription('Причина блокировки')
      .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('target').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({
      content: 'У вас нет разрешения, необходимого для выполнения этой команды! (`BAN_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'Человек, которого вы хотите заблокировать, находится выше вас!',
      ephemeral: true
    });

    if (!user.bannable) return interaction.reply({
      content: 'Человек, которого вы хотите заблокировать выше меня! Поэтому я не могу забанить его.',
      ephemeral: true
    });

    if (interaction.options.getString('raison')) {
      user.ban({
        reason: interaction.options.getString('raison'),
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** был заблокирован.`
      });
    } else {
      user.ban({
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** был заблокирован.`
      });
    };
  },
};