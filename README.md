Ethertoff.js
============

Ethertoff is a simple collaborative web platform, much resembling a wiki but
featuring realtime editing (à la Etherpad). Its output is constructed with
equal love for print and web.

> Just a question: I thought it was ethertopff and not ethertoff but I don't
> remember why. What is the actual name?
>
> Well someone misspelled ethertopdf as ethertopf which sounds like römertopf
> and than somebody else understood ethertoff like chokotoff and chokotoff
> being Bruxellois I thought it might be the best of all these references

Ethertoff has been initially developed for the OSP 2013 Summerschool ‘Relearn’.
The original version is a mash up of two software systems, Django and Etherpad,
and is complicated to install. This new version is built upon Derby.js which
promises an easier set-up and a smaller technological foot-print.

How to use
----------

This first version of Ethertoff.js provides a bare-bones wiki experience.

A pad is created by typing a link to a non-existing page in the url-bar:

http://localhost:3000/w/name_of_new_pad.html

a read-only version of the pad is then available at:

http://localhost:3000/r/name_of_new_pad.html

One can see the page get updated in real-time.

Road-map
--------

For now the write interfaces is a bare-bones text editor (codemirror, with no
additional options or themes). The read interface can interpret the text as
markdown, or as raw html. 

The idea is that the wiki can handle multiple kinds of resources, and that
dependent on the mime-type of the resource the wiki offers a different kind
of edit and read view. The easiest way to to recognise a mime-type is using
file extension: so a page called documentation.md will be interpreted as
markdown, whereas documentation.html will be recognised as plain html.

To take the file-paradigm further, integration might be offered with the
file-system or git repositories. An inconvenience to Etherpad-like realtime
writing environments is that they force one kind of editing environment. Not
only does this limit the way the content can be edited and back-upped, some
writers also like to combine such moments of real-time collaboration with more
solitary writing experiences.

A possible scenario is to run Ethertoff on one’s own computer, opening up
real-time collaboration to the persons on the same wifi-network. The changes
will be synched to the file-system, and once this collaboration session is
over, the person who brought the Ethertoff can return to a solitary writing
experience, choosing the tools of their liking.

License
-------

(c) Eric Schrijver, 2014 for OSP Open Source Publishing

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

- - -

Installation
------------

Download and install node.js and mongodb

In the terminal, navigate to the folder in which the ethertoff.js files are located. Run:

    npm install

This will attempt to install all depencies.

Create the directory public/derby:
    mkdir -p public/derby

You can load the example content (recommended) into the database:

    node init.js

You should now be able to start ethertoff with the following command:

    npm start

