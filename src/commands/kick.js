const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Выгнать участника.')
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Участник которого вы хотите выгнать')
      .setRequired(true))
    .addStringOption(option =>
        option.setName('raison')
        .setDescription('Причина кика')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('target').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({
      content: 'У вас нет разрешения, необходимого для выполнения этой команды! (`KICK_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'Человек, которого вы хотите выгнать, находится выше вас!',
      ephemeral: true
    });

    if (!user.kickable) return interaction.reply({
      content: 'Человек, которого вы хотите выгнать выше меня! Поэтому я не могу забанить его.',
      ephemeral: true
    });

    if (interaction.options.getString('raison')) {
      user.kick(interaction.options.getString('raison'))
      interaction.reply({
        content: `**${user.user.tag}** был исключен.`
      });
    } else {
      user.kick()
      interaction.reply({
        content: `**${user.user.tag}** был исключен.`
      });
    };
  },
};