const { Collection, EmbedBuilder, subtext, userMention } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs/promises');
const datapath = path.join(__dirname, "..", "..", "data", "tags.json");

let tagdata = new Collection();

async function setTagData() {
    let data = await require(datapath);
    for (const [key, value] of Object.entries(data)) {
        tagdata.set(key, value)
    }

    exports.tagdata = tagdata;
};  

// find a tag from regex/flags
function FindTag(method, input) {
    switch (method) {
        case 'regex':
            for (const [name, tag] of tagdata.entries()) {
            const regex = new RegExp(tag.regex, 'i');
                if (regex.test(input)) {
                    const result = tagdata.get(name);
                    result.key = name;
                    return result;
                }
            }
        case 'flags':
            const result = tagdata.get(input) ?? tagdata.find((tag) => tag.flags.includes(input)) ?? null;
            if (result)
                result.key = input;
            return result;
    }
};

// get the ranking of a tag using its key
function GetTagRanking(tagkey) {
    const ranking = new Collection();
    for (const [tagname, tagobj] of tagdata.entries()) {
        if (ranking.has(tagobj.uses))
            ranking.set(tagobj.uses, ranking.get(tagobj.uses).concat(tagname));
        else
            ranking.set(tagobj.uses, [tagname]);
    }
    ranking.sort((x, y) => y - x); // sort by uses descending
    let actualRank = 0;
    for (const [, tags] of ranking.entries()) {
        actualRank++;
        if (tags.includes(tagkey)) {
            return actualRank;
        }
    }
    return null;
};

function IncreaseTagUsage(tagkey) {
    fs.readFile(datapath)
    .then(body => JSON.parse(body))
        .then(json => {
        json[tagkey].uses = json[tagkey].uses + 1;
        tagdata.get(tagkey).uses = json[tagkey].uses; // update in-memory data
        return json
    })
    .then(json => JSON.stringify(json, null, 2))
    .then(body => fs.writeFile(datapath, body))
    .catch(error => console.log(error))
};

// builds an embed based on the tag obj
function TagEmbedBuilder(obj) {
    return new EmbedBuilder()
        .setColor(obj.member.displayColor || 0x5C146C)
        .setDescription(obj.content.replaceAll('\\n', '\n') + '\n\n' + subtext(`${obj.member.user} used the tag "${obj.key}"`))
}

module.exports = {
    setTagData,
    FindTag,
    GetTagRanking,
    IncreaseTagUsage,
    TagEmbedBuilder,
    tagdata
};