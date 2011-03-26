/*

Jappix - An open social platform
These are the microblog JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 26/03/11

*/

// Displays a given microblog item
function displayMicroblog(packet, from, hash, mode) {
	// Get some values
	var iParse = $(packet.getNode()).find('items item');
	
	iParse.each(function() {
		// Initialize
		var tTitle, tFiltered, tTime, tDate, tStamp, tBody, tName, tID, tHash, tIndividual, tFEClick;
		
		// Arrays
		var tFName = [];
		var tFURL = [];
		var tFThumb = [];
		var tFSource = [];
		var tFType = [];
		var tFLength = [];
		
		// Get the values
		tDate = $(this).find('published').text();
		tBody = $(this).find('body').text();
		tID = $(this).attr('id');
		tName = getBuddyName(from);
		tHash = 'update-' + hex_md5(tName + tDate + tID);
		
		// Read attached files with a thumb (place them at first)
		$(this).find('link[rel=enclosure][hrefthumb]').each(function() {
			tFName.push($(this).attr('title'));
			tFURL.push($(this).attr('href'));
			tFThumb.push($(this).attr('hrefthumb'));
			tFSource.push($(this).attr('source'));
			tFType.push($(this).attr('type'));
			tFLength.push($(this).attr('length'));
		});
		
		// Read attached files without any thumb
		$(this).find('link[rel=enclosure]:not([hrefthumb])').each(function() {
			tFName.push($(this).attr('title'));
			tFURL.push($(this).attr('href'));
			tFThumb.push($(this).attr('hrefthumb'));
			tFSource.push($(this).attr('source'));
			tFType.push($(this).attr('type'));
			tFLength.push($(this).attr('length'));
		});
		
		// Get the repeat value
		var uRepeat = [$(this).find('source author nick').text(), $(this).find('source author jid').text()];
		var uRepeated = false;
		
		if(!uRepeat[0])
			uRepeat = [getBuddyName(from), uRepeat[1]];
		if(!uRepeat[1])
			uRepeat = [uRepeat[0], from];
		
		// Repeated?
		if(uRepeat[1] != from)
			uRepeated = true;
		
		// Get the comments node
		var entityComments, nodeComments;
		
		// Get the comments
		var comments_href = $(this).find('link[title=comments]:first').attr('href');
		
		if(comments_href && comments_href.match(/^xmpp:(.+)\?;node=(.+)/)) {
			entityComments = decodeURIComponent(RegExp.$1);
			nodeComments = decodeURIComponent(RegExp.$2);
		}
		
		// No comments node?
		if(!entityComments || !nodeComments) {
			entityComments = '';
			nodeComments = '';
		}
		
		// Get the stamp & time
		if(tDate) {
			tStamp = extractStamp(Date.jab2date(tDate));
			tTime = parseDate(tDate);
		}
		
		else {
			tStamp = getTimeStamp();
			tTime = '';
		}
		
		// Retrieve the message body
		if(tBody)
			tTitle = tBody;
		else
			tTitle = $(this).find('title:last').text();
		
		// Trim the content
		tTitle = trim(tTitle);
		
		// Any content?
		if(tTitle) {
			// Apply links to message body
			tFiltered = filterThisMessage(tTitle, tName.htmlEnc(), true);
			
			// Display the received message
			var html = '<div class="one-update ' + hash + ' ' + tHash + '" data-stamp="' + tStamp + '">' + 
					'<div class="avatar-container">' + 
						'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
					'</div>' + 
					
					'<div class="body">' + 
						'<p>';
			
			// Is it a repeat?
			if(uRepeated)
				html += '<a href="#" class="repeat talk-images" title="' + encodeQuotes(printf(_e("This is a repeat from %s"), uRepeat[0] + ' (' + uRepeat[1] + ')')) + '" onclick="return checkChatCreate(\'' + encodeQuotes(uRepeat[1]) + '\', \'chat\');"></a>';
			
			html += '<b title="' + from + '">' + tName.htmlEnc() + '</b> <span>' + tFiltered + '</span></p>' + 
				'<p class="infos">' + tTime + '</p>';
			
			// Any file to display?
			if(tFURL.length)
				html += '<p class="file">';
			
			for(var f = 0; f < tFURL.length; f++) {
				// Not enough data?
				if(!tFName[f] || !tFURL[f] || !tFType[f])
					continue;
				
				// Get the file types
				var tFExt = explodeThis('/', tFType[f], 1);
				var tfCat = fileCategory(tFExt);
				
				// Supported image/video/sound
				if(tFExt && ((tFExt == 'jpg') || (tFExt == 'jpeg') || (tFExt == 'png') || (tFExt == 'gif') || (tFExt == 'ogg') || (tFExt == 'oga') || (tFExt == 'ogv')))
					tFEClick = 'onclick="return applyIntegrateBox(\'' + encodeOnclick(tFURL[f]) + '\', \'' + encodeOnclick(tfCat) + '\');" ';
				else
					tFEClick = '';
				
				// Any thumbnail?
				if(tFThumb[f])
					html += '<a class="thumb" ' + tFEClick + 'href="' + encodeQuotes(tFURL[f]) + '" target="_blank" title="' + encodeQuotes(tFName[f]) + '"><img src="' + encodeQuotes(tFThumb[f]) + '" alt="" /></a>';
				else
					html += '<a class="' + encodeQuotes(tfCat) + ' link talk-images" ' + tFEClick + 'href="' + encodeQuotes(tFURL[f]) + '" target="_blank">' + tFName[f].htmlEnc() + '</a>';
			}
			
			if(tFURL.length)
				html += '</p>';
			
			// It's my own notice, we can remove it!
			if(from == getXID())
				html += '<a href="#" onclick="return removeMicroblog(\'' + encodeOnclick(tID) + '\', \'' + encodeOnclick(tHash) + '\', \'' + encodeQuotes(entityComments) + '\', \'' + encodeQuotes(nodeComments) + '\');" title="' + _e("Remove this notice") + '" class="mbtool remove talk-images"></a>';
			
			// Notice from another user
			else {
				// User profile
				html += '<a href="#" title="' + _e("View profile") + '" class="mbtool profile talk-images" onclick="return openUserInfos(\'' + encodeOnclick(from) + '\');"></a>';
				
				// If PEP is enabled
				if(enabledPEP())
					html += '<a href="#" title="' + _e("Repeat this notice") + '" class="mbtool repost talk-images"></a>';
			}
			
			html += '</div></div>';
			
			// Mixed mode
			if((mode == 'mixed') && !exists('.mixed .' + tHash)) {
				// Get the nearest element
				var nearest = sortElementByStamp(tStamp, '#channel .mixed .one-update');
				
				// Append the content at the right position (date relative)
				if(nearest == 0)
					$('#channel .content.mixed').append(html);
				else
					$('#channel .one-update[data-stamp=' + nearest + ']:first').before(html);
				
				// Remove the old notices to make the DOM lighter
				var oneUpdate = '#channel .content.mixed .one-update';
				
				if($(oneUpdate).size() > 40)
					$(oneUpdate + ':last').remove();
				
				// Click event on avatar/name
				$('.mixed .' + tHash + ' .avatar-container, .mixed .' + tHash + ' .body b').click(function() {
					getMicroblog(from, hash);
				});
			}
			
			// Individual mode
			tIndividual = '#channel .content.individual.microblog-' + hash;
			
			if(exists(tIndividual) && !exists('.individual .' + tHash)) {
				if(mode == 'mixed')
					$(tIndividual).prepend(html);
				else
					$(tIndividual + ' a.more').css('visibility', 'visible').before(html);
				
				// Click event on name (if not me!)
				if(from != getXID())
					$('.individual .' + tHash + ' .avatar-container, .individual .' + tHash + ' .body b').click(function() {
						checkChatCreate(from, 'chat');
					});
			}
			
			// Apply the click event
			$('.' + tHash + ' a.repost').click(function() {
				return publishMicroblog(tTitle, tFName, tFURL, tFType, tFLength, tFThumb, uRepeat);
			});
			
			// Apply the hover event
			if(nodeComments)
				$('.' + tHash).hover(function() {
					// Don't request twice!
					if(!$(this).find('div.comments').size()) {
						// Generate an unique ID
						var idComments = genID();
						
						// Create comments container
						$(this).append(
							'<div class="comments" data-id="' + idComments + '">' + 
								'<div class="arrow talk-images"></div>' + 
								'<div class="comments-content">' + 
									'<a href="#" class="one-comment loading"><span class="icon talk-images"></span>' + _e("Show comments") + '</a>' + 
								'</div>' + 
							'</div>'
						);
						
						// Click event
						$(this).find('div.comments a.one-comment').click(function() {
							// Set loading info
							$(this).parent().html('<div class="one-comment loading"><span class="icon talk-images"></span>' + _e("Loading comments...") + '</div>');
							
							// Request comments
							getCommentsMicroblog(entityComments, nodeComments, idComments);
							
							// Remove the comments from the DOM if click away
							$('#channel').die('click');
							
							$('#channel').live('click', function(evt) {
								if(!$(evt.target).parents('.' + tHash).size()) {
									$('#channel').die('click');
									$('#channel .one-update div.comments').stopTime().remove();
								}
							});
							
							return false;
						});
					}
				}, function() {
					if($(this).find('div.comments a.one-comment.loading').size())
						$(this).find('div.comments').remove();
				});
		}
	});
	
	// Display the avatar of this buddy
	getAvatar(from, 'cache', 'true', 'forget');
}

// Removes a given microblog item
function removeMicroblog(id, hash, comments_server, comments_node) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#publisher-delete */
	
	// Remove the item from our DOM
	$('.' + hash).remove();
	
	// Send the IQ to remove the item (and get eventual error callback)
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var retract = pubsub.appendChild(iq.buildNode('retract', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB}));
	retract.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleErrorReply);
	
	// Any comments node to remove?
	if(comments_node && (comments_server == getXID()))
		removeCommentsMicroblog(comments_node);
	
	return false;
}

// Gets a given microblog comments node
function getCommentsMicroblog(server, node, id) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#subscriber-retrieve-requestall */
	
	var iq = new JSJaCIQ();
	iq.setType('get');
	iq.setID('get_' + genID() + '-' + id);
	iq.setTo(server);
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('items', {'node': node, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleCommentsMicroblog);
	
	return false;
}

// Handles a microblog comments node items
function handleCommentsMicroblog(iq) {
	// Path
	var id = explodeThis('-', iq.getID(), 1);
	var path = '#channel .one-update div.comments[data-id=' + id + '] div.comments-content';
	
	// Does not exist?
	if(!exists(path))
		return false;
	
	// Any error?
	if(handleErrorReply(iq)) {
		$(path).find('.one-comment').text(_e("Could not get the comments!"));
		
		return false;
	}
	
	// Initialize
	var data = iq.getNode();
	var server = bareXID(getStanzaFrom(iq));
	var node = $(data).find('items:first').attr('node');
	var code = '';
	
	// Must we create the complete DOM?
	var complete = true;
	
	if($(path).find('.one-comment.compose').size())
		complete = false;
	
	// Add the comment tool
	if(complete)
		code += '<div class="one-comment compose">' + 
				'<span class="icon talk-images"></span><input type="text" placeholder="' + _e("Type your comment here...") + '" />' + 
			'</div>';
	
	// Append the comments
	$(data).find('item').each(function() {
		// Get comment
		var current_id = $(this).attr('id');
		var current_xid = $(this).find('source author jid').text();
		var current_date = $(this).find('published').text();
		var current_body = $(this).find('title').text();
		var current_name;
		
		// Yet displayed? (continue the loop)
		if($(path).find('.one-comment[data-id=' + current_id + ']').size())
			return;
		
		// No XID?
		if(!current_xid) {
			current_name = _e("unknown");
			current_xid = '';
		}
		
		else
			current_name = getBuddyName(current_xid);
		
		// No date?
		if(!current_date)
			current_date = relativeDate(current_date);
		else
			current_date = getCompleteTime();
		
		// Click event
		var onclick = 'false';
		
		if(current_xid != getXID())
			onclick = 'checkChatCreate(\'' + encodeQuotes(current_xid) + '\', \'chat\')';
		
		// If this is my comment, add a marker
		var type = 'him';
		var marker = '';
		var remove = '';
		
		if(current_xid == getXID()) {
			type = 'me';
			marker = '<div class="marker"></div>';
			remove = '<a href="#" class="remove" onclick="return removeCommentMicroblog(\'' + encodeQuotes(server) + '\', \'' + encodeQuotes(node) + '\', \'' + encodeQuotes(current_id) + '\');">' + _e("Remove") + '</a>';
		}
		
		// New comment?
		var new_class = '';
		
		if(!complete)
			new_class = ' new';
		
		// Add the comment
		if(current_body)
			code += '<div class="one-comment ' + type + new_class + '" data-id="' + encodeQuotes(current_id) + '">' + 
					marker + 
					'<a href="#" onclick="return ' + onclick + ';" title="' + encodeQuotes(current_xid) + '" class="name">' + current_name.htmlEnc() + '</a>' + 
					'<span class="date">' + current_date.htmlEnc() + '</span>' + 
					remove + 
					'<p class="body">' + filterThisMessage(current_body, current_name, true) + '</p>' + 
				'</div>';
	});
	
	// Add the HTML
	if(complete)
		$(path).html(code);
	else {
		$(path).find('.one-comment.compose').after(code);
		
		// Beautiful effect
		$(path).find('.one-comment.new').slideDown('fast').removeClass('new');
	}
	
	// DOM events
	if(complete) {
		// Update timer
		$(path).everyTime('60s', function() {
			getCommentsMicroblog(server, node, id);
		});
		
		// Input key event
		$(path).find('.one-comment.compose input').placeholder()
			             .keyup(function(e) {
			             		if((e.keyCode == 13) && $(this).val()) {
			             			// Send the comment!
			             			sendCommentsMicroblog($(this).val(), server, node, id);
			             			
			             			// Reset the input value
			             			$(this).val('');
			             			
			             			return false;
			             		}
			             });
	}
}

// Sends a comment on a given microblog comments node
function sendCommentsMicroblog(value, server, node, id) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#publisher-publish */
	
	// Not enough data?
	if(!value || !server || !node)
		return false;
	
	// Get some values
	var date = getXMPPTime('utc');
	var hash = hex_md5(value + date);
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setType('set');
	iq.setTo(server);
	iq.setID('get_' + genID() + '-' + id);
	
	// PubSub main elements
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': node, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'id': hash, 'xmlns': NS_PUBSUB}));
	var entry = item.appendChild(iq.buildNode('entry', {'xmlns': NS_ATOM}));
	
	// Create the comment
	entry.appendChild(iq.buildNode('title', {'xmlns': NS_ATOM}, value));
	entry.appendChild(iq.buildNode('published', {'xmlns': NS_ATOM}, date));
	
	// Author XID
	var Source = entry.appendChild(iq.buildNode('source', {'xmlns': NS_ATOM}));
	var author = Source.appendChild(iq.buildNode('author', {'xmlns': NS_ATOM}));
	author.appendChild(iq.buildNode('jid', {'xmlns': NS_ATOM}, getXID()));
	
	con.send(iq);
	
	// Handle this comment!
	handleCommentsMicroblog(iq);
	
	return false;
}

// Removes a given microblog comments node
function removeCommentsMicroblog(node) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#owner-delete */
	
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
	pubsub.appendChild(iq.buildNode('delete', {'node': node, 'xmlns': NS_PUBSUB_OWNER}));
	
	con.send(iq);
	
	return false;
}

// Removes a given microblog comment item
function removeCommentMicroblog(server, node, id) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#publisher-delete */
	
	// Remove the item from our DOM
	$('.one-comment[data-id=' + id + ']').slideUp('fast', function() {
		$(this).remove();
	});
	
	// Send the IQ to remove the item (and get eventual error callback)
	var iq = new JSJaCIQ();
	iq.setType('set');
	iq.setTo(server);
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var retract = pubsub.appendChild(iq.buildNode('retract', {'node': node, 'xmlns': NS_PUBSUB}));
	retract.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	
	con.send(iq);
	
	return false;
}

// Handles the microblog of an user
function handleMicroblog(iq) {
	// Get the from attribute of this IQ
	var from = fullXID(getStanzaFrom(iq));
	
	logThis('Microblog got: ' + from, 3);
	
	// Define the selector path
	var selector = '#channel .top.individual input[name=';
	
	// Get the XID of the current buddy
	var xid = $(selector + 'jid]').val();
	
	// Is this request alive?
	if(from == xid) {
		var hash = hex_md5(xid);
		
		// Update the items counter
		var old_count = parseInt($(selector + 'counter]').val());
		$(selector + 'counter]').val(old_count + 20);
		
		// Display the microblog
		displayMicroblog(iq, xid, hash, 'individual');
		
		// Hide the waiting icon
		if(enabledPEP())
			waitMicroblog('sync');
		else
			waitMicroblog('unsync');
		
		// Hide the 'more items' link?
		if($(iq.getNode()).find('item').size() < old_count)
			$('#channel .individual a.more').remove();
	}
}

// Resets the microblog elements
function resetMicroblog() {
	// Remove the individual channel
	$('#channel .individual').remove();
	
	// Show the mixed channel
	$('#channel .mixed').show();
	
	// Hide the waiting icon
	if(enabledPEP())
		waitMicroblog('sync');
	else
		waitMicroblog('unsync');
	
	return false;
}

// Gets the microblog of an user
function getMicroblog(xid, hash) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#subscriber-retrieve */
	
	logThis('Get the microblog: ' + xid, 3);
	
	// Fire the wait event
	waitMicroblog('fetch');
	
	// Remove the previous individual channel
	if(!exists('#channel .individual')) {
		$('#channel .individual').remove();
		
		// Hide the mixed channel
		$('#channel .mixed').hide();
		
		// Get the channel title depending on the XID
		var cTitle;
		
		if(xid == getXID())
			cTitle = _e("Your channel");
		else
			cTitle = _e("Channel of") + ' ' + getBuddyName(xid).htmlEnc();
		
		// Create a new individual channel
		$('#channel .content.mixed').after(
				'<div class="content individual microblog-' + hash + '">' + 
					'<a href="#" class="more home-images" onclick="return getMicroblog(\'' + encodeOnclick(xid) + '\', \'' + encodeOnclick(hash) + '\');">' + _e("More notices...") + '</a>' + 
				'</div>'
						 )
					   
					   .before(
				'<div class="top individual ' + hash + '">' + 
					'<div class="avatar-container">' + 
						'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
					'</div>' + 
					
					'<div class="update">' + 
						'<h2>' + cTitle + '</h2>' + 
						'<a href="#" onclick="return resetMicroblog();">« ' + _e("Previous") + '</a>' + 
					'</div>' + 
					
					'<input type="hidden" name="jid" value="' + xid + '" />' + 
					'<input type="hidden" name="counter" value="' + 20 + '" />' + 
				'</div>'
						 );
		
		// Display the user avatar
		getAvatar(xid, 'cache', 'true', 'forget');
	}
	
	// Get the number of items to retrieve
	var items = $('#channel .top.individual input[name=counter]').val();
	
	// Ask the server the user's microblog 
	var iq = new JSJaCIQ();
	iq.setType('get');
	iq.setTo(xid);
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('items', {'node': NS_URN_MBLOG, 'max_items': items, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleMicroblog);
	
	return false;
}

// Show a given microblog waiting status
function waitMicroblog(type) {
	// First hide all the infos elements
	$('#channel .footer div').hide();
	
	// Display the good one
	$('#channel .footer div.' + type).show();
	
	// Depending on the type, disable/enable certain tools
	var selector = $('#channel .top input[name=microblog_body]');
	
	if(type == 'unsync')
		selector.attr('disabled', true);
	else if(type == 'sync')
		$(document).oneTime(10, function() {
			selector.removeAttr('disabled').focus();
		});
}

// Setups a new microblog
function setupMicroblog(node, persist, maximum, create) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#owner-create-and-configure */
	
	// Create the PubSub node
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	
	// Create it?
	if(create)
		pubsub.appendChild(iq.buildNode('create', {'xmlns': NS_PUBSUB, 'node': node}));
	
	// Configure it!
	var configure = pubsub.appendChild(iq.buildNode('configure', {'node': node, 'xmlns': NS_PUBSUB_OWNER}));
	var x = configure.appendChild(iq.buildNode('x', {'xmlns': NS_XDATA, 'type': 'submit'}));
	
	var field1 = x.appendChild(iq.buildNode('field', {'var': 'FORM_TYPE', 'type': 'hidden', 'xmlns': NS_XDATA}));
	field1.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, NS_PUBSUB_NC));
	
	var field2 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#persist_items', 'xmlns': NS_XDATA}));
	field2.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, persist));
	
	var field3 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#max_items', 'xmlns': NS_XDATA}));
	field3.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, maximum));
	
	// Allow subscribers to write on that node?
	if(node != NS_URN_MBLOG) {
		var field4 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#publish_model', 'xmlns': NS_XDATA}));
		field4.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, 'open'));
	}
	
	con.send(iq);
}

// Gets the microblog configuration
function getConfigMicroblog() {
	// Lock the microblog options
	$('#persistent, #maxnotices').attr('disabled', true);
	
	// Get the microblog configuration
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
	pubsub.appendChild(iq.buildNode('configure', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB_OWNER}));
	
	con.send(iq, handleGetConfigMicroblog);
}

// Handles the microblog configuration
function handleGetConfigMicroblog(iq) {
	// Reset the options stuffs
	waitOptions('microblog');
	
	// Unlock the microblog options
	$('#persistent, #maxnotices').removeAttr('disabled');
	
	// End if not a result
	if(!iq || (iq.getType() != 'result'))
		return;
	
	// Initialize the values
	var selector = $(iq.getNode());
	var persistent = '0';
	var maxnotices = '10000';
	
	// Get the values
	var xPersistent = selector.find('field[var=pubsub#persist_items] value:first').text();
	var xMaxnotices = selector.find('field[var=pubsub#max_items] value:first').text();
	
	// Any value?
	if(xPersistent)
		persistent = xPersistent;
	
	if(xMaxnotices)
		maxnotices = xMaxnotices;
	
	// Change the maxnotices value
	switch(maxnotices) {
		case '50':
		case '100':
		case '500':
		case '1000':
		case '5000':
		case '10000':
			break;
		
		default:
			maxnotices = '10000';
			break;
	}
	
	// Apply persistent value
	if(persistent == '0')
		$('#persistent').attr('checked', false);
	else
		$('#persistent').attr('checked', true);
	
	// Apply maxnotices value
	$('#maxnotices').val(maxnotices);
}

// Handles the user's microblog
function handleMyMicroblog(packet) {
	// Reset the entire form
	$('#channel .top input[name=microblog_body]').removeAttr('disabled').val('');
	unattachMicroblog();
	
	// Check for errors
	handleErrorReply(packet);
}

// Performs the microblog sender checks
function sendMicroblog() {
	logThis('Send a new microblog item', 3);
	
	// Avoid nasty errors
	try {
		// Get the values
		var selector = $('#channel .top input[name=microblog_body]');
		var body = trim(selector.val());
		
		// Sufficient parameters
		if(body) {
			// Disable & blur our input
			selector.attr('disabled', true).blur();
			
			// Files array
			var fName = [];
			var fType = [];
			var fLength = [];
			var fURL = [];
			var fThumb = [];
			
			// Read the files
			$('#attach .one-file').each(function() {
				// Push the values!
				fName.push($(this).find('a.link').text());
				fType.push($(this).attr('data-type'));
				fLength.push($(this).attr('data-length'));
				fURL.push($(this).find('a.link').attr('href'));
				fThumb.push($(this).attr('data-thumb'));
			});
			
			// Send the message on the XMPP network
			publishMicroblog(body, fName, fURL, fType, fLength, fThumb);
		}
	}
	
	// Return false (security)
	finally {
		return false;
	}
}

// Publishes a given microblog item
function publishMicroblog(body, attachedname, attachedurl, attachedtype, attachedlength, attachedthumb, repeat) {
	/* REF: http://xmpp.org/extensions/xep-0277.html */
	
	// Generate some values
	var time = getXMPPTime('utc');
	var id = hex_md5(body + time);
	var nick = getName();
	var xid = getXID();
	
	// Define repeat options
	var author_nick = nick;
	var author_xid = xid;
	
	if(repeat && repeat.length) {
		author_nick = repeat[0];
		author_xid = repeat[1];
	}
	
	// Define comments options
	var comments_entity = xid;
	var comments_node = NS_URN_MBLOG + ':comments:' + id;
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setType('set');
	iq.setTo(xid);
	
	// Create the main XML nodes/childs
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	var entry = item.appendChild(iq.buildNode('entry', {'xmlns': NS_ATOM}));
	
	// Create the XML source childs
	var Source = entry.appendChild(iq.buildNode('source', {'xmlns': NS_ATOM}));
	Source.appendChild(iq.buildNode('title', {'xmlns': NS_ATOM}, 'Microblog (' + nick + ')'));
	Source.appendChild(iq.buildNode('updated', {'xmlns': NS_ATOM}, time));
	
	var author = Source.appendChild(iq.buildNode('author', {'xmlns': NS_ATOM}));
	author.appendChild(iq.buildNode('nick', {'xmlns': NS_ATOM}, author_nick));
	author.appendChild(iq.buildNode('jid', {'xmlns': NS_ATOM}, author_xid));
	
	// Create the XML entry childs
	entry.appendChild(iq.buildNode('title', {'xmlns': NS_ATOM}, body));
	entry.appendChild(iq.buildNode('body', {'xmlns': NS_ATOM}, body));
	entry.appendChild(iq.buildNode('published', {'xmlns': NS_ATOM}, time));
	entry.appendChild(iq.buildNode('updated', {'xmlns': NS_ATOM}, time));
	entry.appendChild(iq.buildNode('link', {
			'rel': 'alternate',
			'href': 'xmpp:' + encodeURIComponent(xid) + '?;node=' + encodeURIComponent(NS_URN_MBLOG) + ';item=' + encodeURIComponent(id),
			'xmlns': NS_ATOM
	}));
	
	// Create the attached files nodes
	for(var i = 0; i < attachedurl.length; i++) {
		// Not enough data?
		if(!attachedname[i] || !attachedurl[i] || !attachedtype[i])
			continue;
		
		// Append a new file element
		var file = entry.appendChild(iq.buildNode('link', {'xmlns': NS_ATOM, 'rel': 'enclosure', 'title': attachedname[i], 'type': attachedtype[i], 'length': attachedlength, 'href': attachedurl[i]}));
		
		// Any thumbnail?
		if(attachedthumb[i])
			file.setAttribute('hrefthumb', attachedthumb[i]);
	}
	
	// Create the comments child
	entry.appendChild(iq.buildNode('link', {'xmlns': NS_ATOM, 'rel': 'related', 'title': 'comments', 'href': 'xmpp:' + encodeURIComponent(comments_entity) + '?;node=' + encodeURIComponent(comments_node)}));
	
	// Send the IQ
	con.send(iq, handleMyMicroblog);
	
	// Create the XML comments PubSub node
	setupMicroblog(comments_node, '1', '10000', true);
	
	return false;
}

// Attaches a file to a microblog post
function attachMicroblog() {
	// File upload vars
	var attach_options = {
		dataType:	'xml',
		beforeSubmit:	waitMicroblogAttach,
		success:	handleMicroblogAttach
	};
	
	// Upload form submit event
	$('#attach').submit(function() {
		if(!exists('#attach .wait') && $('#attach input[type=file]').val())
			$(this).ajaxSubmit(attach_options);
		
		return false;
	});
	
	// Upload input change event
	$('#attach input[type=file]').change(function() {
		if(!exists('#attach .wait') && $(this).val())
			$('#attach').ajaxSubmit(attach_options);
		
		return false;
	});
}

// Unattaches a microblog file
function unattachMicroblog(id) {
	// Individual removal?
	if(id)
		$('#attach .one-file[data-id=' + id + ']').remove();
	else
		$('#attach .one-file').remove();
	
	// Must enable the popup again?
	if(!exists('#attach .one-file')) {
		// Restore the bubble class
		$('#attach').addClass('bubble');
		
		// Enable the bubble click events
		if(id) {
			$('#attach').hide();
			showBubble('#attach');
		}
		
		else
			closeBubbles();
	}
	
	return false;
}

// Wait event for file attaching
function waitMicroblogAttach() {
	// Append the wait icon
	$('#attach input[type=submit]').after('<div class="wait wait-medium"></div>');
	
	// Lock the bubble
	$('#attach').removeClass('bubble');
}

// Success event for file attaching
function handleMicroblogAttach(responseXML) {
	// Data selector
	var dData = $(responseXML).find('jappix');
	
	// Process the returned data
	if(dData.find('error').size()) {
		openThisError(4);
		
		// Unlock the bubble?
		if(!exists('#attach .one-file')) {
			$('#attach').addClass('bubble').hide();
			
			// Show the bubble again!
			showBubble('#attach');
		}
		
		logThis('Error while attaching the file: ' + dData.find('error').text(), 1);
	}
	
	else {
		// Do not allow this bubble to be hidden
		$('#attach').removeClass('bubble');
		
		// Get the file values
		var fName = dData.find('title').text();
		var fType = dData.find('type').text();
		var fLength = dData.find('length').text();
		var fURL = dData.find('href').text();
		var fThumb = dData.find('thumb').text();
		
		// Generate a file ID
		var fID = hex_md5(fURL);
		
		// Add this file
		$('#attach .attach-subitem').append(
			'<div class="one-file" data-type="' + encodeQuotes(fType) + '" data-length="' + encodeQuotes(fLength) + '" data-thumb="' + encodeQuotes(fThumb) + '" data-id="' + fID + '">' + 
				'<a class="remove talk-images" href="#" title="' + encodeQuotes(_e("Unattach the file")) + '"></a>' + 
				'<a class="link" href="' + encodeQuotes(fURL) + '" target="_blank">' + fName.htmlEnc() + '</a>' + 
			'</div>'
		);
		
		// Click event
		$('#attach .one-file[data-id=' + fID + '] a.remove').click(function() {
			return unattachMicroblog(fID);
		});
		
		logThis('File attached.', 3);
	}
	
	// Reset the attach bubble
	$('#attach input[type=file]').val('');
	$('#attach .wait').remove();
	
	// Focus on the text input
	$(document).oneTime(10, function() {
		$('#channel .top input[name=microblog_body]').focus();
	});
}

// Shows the microblog of an user from his infos
function fromInfosMicroblog(xid, hash) {
	// Renitialize the channel
	resetMicroblog();
	
	// Switch to the channel
	switchChan('channel');
	
	// Get the microblog
	getMicroblog(xid, hash);
}

// Plugin launcher
function launchMicroblog() {
	// Keyboard event
	$('#channel .top input[name=microblog_body]').keyup(function(e) {
		// Enter pressed: send the microblog notice
		if((e.keyCode == 13) && !exists('#attach .wait'))
			return sendMicroblog();
	});
	
	// Microblog file attacher
	attachMicroblog();
}
