const { EmbedBuilder, heading } = require('discord.js');
const path = require('node:path');
const { IncreaseTagUsage, FindTag, TagEmbedBuilder } = require(path.join(__dirname, "..", "..", "data", "js", "tags.js"));
const debug = require(path.join(__dirname, "..", "..", "data", "tags.json"));

module.exports = {
    data: {name: 'tags-chat', type: 'message'},
    async execute(message) {
        const fetchedmember = await message.guild.members.fetch(message.member.user.id)
        if (message.args[1] == undefined) {
            const fetchedemoji = debug ? '' : await message.client.application.emojis.fetch('1361915029578055701') // error emoji
            const embed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(`${heading(fetchedemoji.toString() + ' Missing parameter', 2)}\nYou need to specify regex to use.`)
            message.reply({ embeds : [embed]})
            return;
        }
        tag = FindTag('regex', message.args.join(' '));
        if (tag) {
            tag.member = fetchedmember
            const tagEmbed = TagEmbedBuilder(tag)
            
            try { var referencedMessage = await message.fetchReference(); }
            catch { var referencedMessage = null; } // if message not found

            if (referencedMessage) {
                referencedMessage.reply({ embeds : [tagEmbed]});
                message.delete();
            } else {
                const fetchedChannel = await message.client.channels.fetch(message.channel.id);
                fetchedChannel.send({ embeds : [tagEmbed]})
                const cleancontent = message.content.toLowerCase();
                if (cleancontent.includes('del') || cleancontent.includes('-'))
                    message.delete();
            }
            IncreaseTagUsage(tag.key);
        } else {
            const fetchedemoji = debug ? '' : await message.client.application.emojis.fetch('1361915029578055701')  // error emoji
            const embed = new EmbedBuilder()
                .setColor(fetchedmember.displayColor || 0x5C146C)
                .setDescription(`${heading(fetchedemoji.toString() + ' Tag not found', 2)}\nYou entered '${message.args.slice(message.args[0].length).join(' ')}', which was not found in the database.`)
            try {
                const botreply = await message.reply({ embeds : [embed]})
                setTimeout(() => {
                    botreply.delete()
                }, 15000)
            } catch (error){
                console.error(`Failed to delete message: ${error} (MessageID: ${message.id})`)
            }
        }
    }
}