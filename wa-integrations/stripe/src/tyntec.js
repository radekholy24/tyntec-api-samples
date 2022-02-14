function composeSendWhatsAppTemplateRequestAxiosConfig(apikey, to, from, templateId, templateLanguage, body, button, opts) {
    const config = {
        method: 'post',
        url: 'https://api.tyntec.com/conversations/v3/messages',
        headers: {
            'accept': 'application/json',
            apikey,
            'content-type': 'application/json'
        },
        data: {
            to,
            from,
            channel: 'whatsapp',
            content: {
                contentType: 'template',
                template: {
                    templateId,
                    templateLanguage,
                    components: {
                        body,
                        button
                    }
                }
            }
        }
    };

    if (opts && opts.header) {
        config.data.content.template.components.header = opts.header;
    }

    return config;
}

module.exports = {
    composeSendWhatsAppTemplateRequestAxiosConfig
};
