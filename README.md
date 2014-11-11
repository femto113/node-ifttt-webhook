node-ifttt-webhook
==================

a Wordpress XML-RPC to webhook proxy server for ifttt

This is entirely inspired by [ifttt-webhook](//github.com/captn3m0/ifttt-webhook), so if
you'd like to understand the whys and wherefores of this look there.

## How To Use

    % git clone https://github.com/femto113/node-ifttt-webhook
    % cd node-ifttt-webhook
    % npm install
    % sudo npm start

Note that you have to run this on a server that is visible to ifttt (i.e. on the 
internet, not behind a firewall).  By default the service will run on port 80,
thus the need for sudo, this can be overridden with the PORT environment variable
but ifttt doesn't seem to like port numbers in the blog URL (YMMV).  Once running
you should be able to activate the WordPress channel and create recipes following
the same instructions as for the PHP version.

One easy way to do this is to use heroku; clone this repository and then, from
inside it, run

    % heroku create
    % git push heroku master

Put the URL for your webhook into IFTTT's "tags" field.

## License

I don't claim any copyright to this code since it's such a close adaptation of
the original, which is licensed under MIT (as are the dependencies).

## Acknowledgements

Obviously entirely derivative of the original PHP version by [captn3m0](//github.com/captn3m0), but also 
wouldn't have been nearly so easy to build without the excellent [node-xmlrpc](//github.com/baalexander/node-xmlrpc)
nor test without [node-wordpress](//github.com/scottgonzalez/node-wordpress).
