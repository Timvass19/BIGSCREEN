3d avec webgl-------------
Url     : http://codes-sources.commentcamarche.net/source/53335-3d-avec-webglAuteur  : HakumbayaDate    : 14/08/2013
Licence :
=========

Ce document intitulé « 3d avec webgl » issu de CommentCaMarche
(codes-sources.commentcamarche.net) est mis à disposition sous les termes de
la licence Creative Commons. Vous pouvez copier, modifier des copies de cette
source, dans les conditions fixées par la licence, tant que cette note
apparaît clairement.

Description :
=============

Il y a maintenant quelques semaines, j'ai soumis ici un codes sources de moteur 
3D sans webGL, &agrave; qui manquait de nombreuses fonctionnalit&eacute;s, &eacu
te;tait peu performant, et dont la m&eacute;thode de texturing etait approximati
ve est difficile &agrave; prendre en main.
<br />
<br />Donc comme promis, voi
ci un aper&ccedil;u de la 3D AVEC webGL. Pour comprendre ce code sources, vous d
evrez deja avoir quelques acquis sur le fonctionnement des moteurs 3D, et bien m
aitriser les expressions vectorielles et matricielles. Cette technologie etant r
&eacute;centes, elle n'est malheureusement pas cross brother (Firefox &agrave; p
artir de 5.0 pour toutes les fonctionnalit&eacute;s, Chrome &agrave; partir de l
a version 9.0). Cette source fonctionne bien entendu toujours mieux sous chrome.
 Vous aurez &eacute;galement besoin d'un serveur local HTTP, comme un Wamp ou un
 easy PHP car l'acc&egrave;s aux ressources comme les textures sont sont pas aut
oris&eacute;es localement.
<br />
<br />Vous trouverez dans cette sources : 

<br /> - un fichier index.htm : Il regroupe les appels &agrave; l'objet WebGL qu
e j'ai cr&eacute;e pour cette d&eacute;monstration et lance l&#8217;aper&ccedil;
u
<br /> - un fichier webgl.js : contient les objets utilis&eacute; par la clas
se webGL (Telle quel la classe de gestion du FPS, ou le gestionnaires de vecteur
/matrice minifi&eacute; =&gt; pour ceux qui se le demande, c'est un juste milieu
 entre sylvesterJS et glMatrix 0.9.5).
<br />- un dossier contant les textures.

<br />
<br />Ce code source n'est pas tr&egrave;s comment&eacute; car tout ex
pliqu&eacute; serai tr&egrave;s long en un seul bloc, mais pour ceux qui veulent
 apprendre pas &agrave; pas, ce que je conseille fort, voici un tutorials tr&egr
ave;s bien fait qui vulgarise assez bien les m&eacute;caniques de WebGL : <a hre
f='http://learningwebgl.com/blog/?page_id=1217' target='_blank'>http://learningw
ebgl.com/blog/?page_id=1217</a>
<br />Je me suis bien aid&eacute; de ce dernier
 pour comprendre plus en profondeur comment fonctionne webGL.
<br />
<br />Pou
r ces question de performances, les fonctionnalit&eacute;s de &quot;specular&quo
t; (brillance des textures) et de render-to-texture (rendu sur une texture) ne s
ont pas impl&eacute;ment&eacute;es. J'ai &eacute;galement la peine de limiter &a
grave; 16 le nombreux de sources lumineuses ponctuelle sur une texture afin d'ev
iter des d&eacute;bordement de memoire, et du clipping &agrave; l'affichage.
<b
r />
<br />Cette source &agrave; pour unique but de faire la d&eacute;monstrati
on de webGL, mais n'est pas une r&eacute;f&eacute;rences. WebGL est encore une t
echnologie r&eacute;cente qui est vou&eacute;e &agrave; &eacute;voluer, et donc 
il n'est pas diffus&eacute; de manuel officiel, il est possible que certaines no
tions soit erron&eacute;es faut de compr&eacute;hension.
<br />
<br />Pour d&e
acute;placer le point de vue, voici les commandes (azerty) :
<br />R : avancer

<br />F : reculer
<br />D : pas &agrave; gauche
<br />G : pas &agrave; droite

<br />Q : aller vers le bas
<br />E : aller vers le haut
<br />
<br />Pour 
changer l'angle du point de vue :
<br />Maintenez le clic souris enfonc&eacute;
e et d&eacute;placez le souris pour une rotation relative sur l'axe Y et Z.
<br
 /><a name='source-exemple'></a><h2> Source / Exemple : </h2>
<br /><pre class
='code' data-mode='basic'>
Tout est dans le zip
</pre>
<br /><a name='conclus
ion'></a><h2> Conclusion : </h2>
<br />Les opportunit&eacute;s que webGL ouvre
nt sont infinies, mais son avanc&eacute;e et brusque, instables et parfois dange
reuse (faille trouv&eacute;e par un hacker exploitant webGL pour recuperer des s
creen shot de navigateur ayant un moteur de rendu de type gecko via une simple i
njection JS...c'est fou non ?!?).
<br />
<br />Je vous conseille donc de vous 
y int&eacute;resser car c'est passionnant, mais il est inutile dans l&#8217;imm&
eacute;diat de s'y jeter corps et &acirc;me tant qu'un vrai outil finalis&eacute
; n'aura pas vu le jour.
<br />Je suis ouvert &agrave; vos question, mais jetez
 un oeil au tutorial avant, tout les point exploit&eacute; dans cette sources so
nt expliqu&eacute;s sur ce tutorial ^^.
