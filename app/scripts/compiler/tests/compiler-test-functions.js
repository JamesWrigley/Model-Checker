'use strict';

/**
 * These serve as helper function for compiler tests. They are used
 * to eliminate duplicating the same code that is used throughout
 * the tests.
 */

// define shorthands for chai.expect and chai.assert
var expect = chai.expect;
var assert = chai.assertl

/**
 * PARSING HELPER FUNCTIONS
 *
 * The following functions are used to help test the parsing of the
 * process grammar.
 */

/**
 * Parses the specified code into an abstract syntax tree and
 * returns the processes that were parsed.
 */
function constructConstantsMap(code){
	var tokens = lexer.parse(code);
	return parse(tokens).constantsMap;
}

/**
 * Parses the specified code into an abstract syntax tree and
 * returns the constants that were parsed.
 */
function constructProcesses(code){
	var tokens = lexer.parse(code);
	return parse(tokens).processes;
}

/**
 * Parses the specified code, converts it into an abstract syntax tree and
 * interprets it into a process map containing data structures of the defined
 * processes.
 *
 * @param {string} code - the process grammar
 * @return {string -> object} - mapping from identifier to process data structure
 */
function constructProcessesMap(code){
	var tokens = lexer.parse(code);
	var ast = parse(tokens);
	var analysis = performAnalysis(ast.processes, {});
	return interpret(ast.processes, ast.variableMap, analysis, {});
}

/**
 * The following functions test explicitly if an ast node was constructed
 * correctly.
 */

/**
 * Tests that the specified const node was constructed correctly by
 * the parser.
 *
 * @param {astNode} node - the const node
 * @param {int} value - the expected value
 */
function testConstNode(node, value){
	expect(node).to.have.property('type', 'const');
	expect(node).to.have.property('value', value);
}

/**
 * Tests that the specified range node was constructed correctly by
 * the parser.
 *
 * @param {astNode} node - the range node
 * @param {int} start - the expected start value
 * @param {int} end - the expected end value
 */
function testRangeNode(node, start, end){
	expect(node).to.have.property('type', 'range');
	expect(node).to.have.property('start', start);
	expect(node).to.have.property('end', end);
}

/**
 * Tests that the specified set node was constructed correctly by
 * the parser.
 *
 * @param {astNode} node - the set node
 * @param {string[]} set - the expected set
 */
function testSetNode(node, set){
	expect(node).to.have.property('type', 'set');
	expect(node).to.have.property('set');
	// have to use deep equals to test the set as they are defined as arrays
	expect(node.set).to.eql(set);
}

/**
 * Tests that the specified action label node was constructed correctly
 * by the parser.
 *
 * @param {astNode} node - the action label node
 * @param {string} action - the expected action label
 */
function testActionLabelNode(node, action){
	expect(node).to.have.property('type', 'action-label');
	expect(node).to.have.property('action', action);
}

/**
 * Tests that the specified terminal node was constructed correctly by
 * the parser.
 *
 * @param {astNode} node - the terminal node
 * @param {string} terminal - the expected terminal
 */
function testTerminalNode(node, terminal){
	expect(node).to.have.property('type', 'terminal');
	expect(node).to.have.property('terminal', terminal);
}

/**
 * Tests that the specified identifier node was constructed correctly by
 * the parser.
 *
 * @param {astNode} node - the identifier node
 * @param {string} ident - the expected identifier
 */
function testIdentifierNode(node, ident){
	expect(node).to.have.property('type', 'identifier');
	expect(node).to.have.property('ident', ident);
}

/**
 * Tests that the specified hiding node was constructed correctly by the
 * parser.
 *
 * @param {astNode} node - the hiding node
 * @param {string} type - the type of hiding operation
 * @param {string[]} - an array of actions
 */
function testHidingNode(node, type, set){
	expect(node).to.have.property('type', type);
	// have to use deep equals to test the set as they are defined as arrays
	expect(node.set).to.eql(set);
}

/** 
 * The following functions do not test explicitly that the ast nodes were
 * constructed correctly. This is because they have nested ast nodes within
 * them. They test the shallow values of the node and leave the deeper tests
 * to the unit tests calling them.
 */

/**
 * Tests that the shallow values in the specified process node were
 * constructed correctly.
 *
 * @param {astNode} node - the process node
 * @param {string} processType - the expected process type
 * @param {string} ident - the expected identifier
 * @param {boolean} hasLocalProcesses - 
 */
function testProcessNode(node, processType, ident, hasLocalProcesses){
	expect(node).to.have.property('type', 'process');
	expect(node).to.have.property('processType', processType);
	expect(node).to.have.property('ident');
	expect(node.ident).to.have.property('type', 'identifier');
	expect(node.ident).to.have.property('ident', ident);
	expect(node).to.have.property('process');

	// if the process node has local processes they will be tested by the unit test
	if(!hasLocalProcesses){
		expect(node).to.have.property('local');
		expect(node.local).to.eql([]);
	}
}

/**
 * Tests that the shallow values in the specified if statment node were
 * constructed correctly.
 *
 * @param {astNode} node - the if statement node
 * @param {string} condition - the expected condition
 * @param (boolean) hasFalseBranch -
 */
function testIfStatementNode(node, condition, hasFalseBranch){
	expect(node).to.have.property('type', 'if-statement');
	expect(node).to.have.property('guard', condition);
	expect(node).to.have.property('trueBranch');

	// test for false branch based on the specified boolean
	if(hasFalseBranch){
		expect(node).to.have.property('falseBranch');
	}
	else{
		expect(node).to.not.have.property('falseBranch');
	}
}

/**
 * Tests that a sequence node was constructed correctly. Checks that the
 * known elements of a sequence (the action labels) are correct and returns
 * the final base process of the sequence to be tested by the unit test
 * calling this function.
 *
 * @param {astNode} node - the sequence node
 * @param {string[]} sequence - an array of action labels
 * @return {astNode} - the base process of the sequence
 */
function testSequenceNode(node, sequence){
	for(var i = 0; i < sequence.length; i++){
		expect(node).to.have.property('type', 'sequence');
		expect(node).to.have.property('from');
		testActionLabelNode(node.from, sequence[i]);
		expect(node).to.have.property('to');
		// sequence nodes are nested, get the next sequence node
		node = node.to;
	}

	// return the final node in the sequence
	return node;
}

/**
 * Tests that a choice node has been constructed correctly. Only shallowly tests
 * the node, the processes in the choice node are left to be tested by the unit
 * tests that call this function.
 *
 * @param {astNode} node - the choice node
 */
function testChoiceNode(node){
	expect(node).to.have.property('type', 'choice');
	expect(node).to.have.property('process1');
	expect(node).to.have.property('process2');
}

/**
 * Tests that the shallow components in the specified function node were
 * constructed correctly.
 *
 * @param {astNode} node - the function node
 * @param {string} functionType - the function type
 */
function testFunctionNode(node, functionType){
	expect(node).to.have.property('type', 'function');
	expect(node).to.have.property('func', functionType);
	expect(node).to.have.property('process');
}

/**
 * INTERPRETING PETRI NET HELPER FUNCTIONS
 *
 * The following functions are use to help test the interpretation of
 * abstract syntax trees.
 */

/**
 * Constructs and returns an array of places containing the specified
 * number of places.
 *
 * @param {int} amount - the number of places to generate
 * @param {int} idStart - the id number to start from
 * @return {place[]) - an array of places
 */
function generatePlaces(amount, idStart){
	var places = [];
	for(var i = 0; i < amount; i++){
		var id = 'test.' + (i + idStart);
		places.push(new PetriNet.Place(id));
	}

	return places;
}

/**
 * Constructs and returns an array of transitions containing a transition for
 * each label in the specified labels array.
 *
 * @param {string[]} labels - the labels to generate transitions for
 * @param {int} idStart - the id number to start from
 * @return {transition[]} - an array of transitions
 */
function generateTransitions(labels, idStart){
	var transitions = [];
	for(var i = 0; i < labels.length; i++){
		var id = 'test.' + (i + idStart);
		transitions.push(new PetriNet.Transition(id, ['test'], labels[i]));
	}

	return transitions;
}

/**
 * Sets up a connection between the two specified place or transition
 * objects.
 */
function setupConnection(from, to){
	if(from.type !== to.type){
		if(from.type === 'place'){
			from.addOutgoingTransition(to.id);
			to.addIncomingPlace(from);
		}
		else if(from.type === 'transition'){
			from.addOutgoingPlace(to);
			to.addIncomingTransition(from.id);
		}
	}
}

/**
 * Constructs a sequential connection between the specified places and transitions,
 * such that the sequence goes:
 *
 * p[0] -> t[0] -> p[1] -> t[1] -> ... -> p[n-1] -> t[n-1] -> p[n]
 *
 * @param {place[]} places - an array of places
 * @param {transition[]} transitions - an array of transitions 
 */
function constructSequentialPetriNet(places, transitions){
	for(var i = 0; i < transitions.length; i++){
		setupConnection(places[i], transitions[i]);
		setupConnection(transitions[i], places[i + 1])
	}
}

function compareBFTGraphs(graph1, graph2){
	// compare node counts for both graphs
	if(graph1.nodeCount !== graph2.nodeCount){
		return false;
	}

	// compare alphabets from both graphs
	if(!compareAlphabets(graph1.alphabet, graph2.alphabet)){
		return false;
	}

	// traverse through both graphs
	var visited = {};
	var fringe = [graph1.root, graph2.root];
	var index = 0;
	while(index < fringe.length){
		var current1 = fringe[index++];
		var current2 = fringe[index++];

		// check if nodes have either not or both been visited
		if(visited[current1.id] !== visited[current2.id]){
			return false;
		}

		var children1 = current1.children;
		var children2 = current2.children;
		for(var i = 0; i < children1.length; i++){
			// children are ordered so each child should match
			if(children1[i] !== children2[i]){
				return false;
			}

			// push current children to fringe
			fringe.push(graph1.getNode(children1[i]), graph2.getNode(children2[i]));
		}

		// mark current nodes as visited
		visited[current1.id] = true;
		visited[current2.id] = true;
	}

	// if algorithm has gotten this far then the graphs are equivalent
	return true;

	function compareAlphabets(alphabet1, alphabet2){
		for(var i in alphabet1){
			var match = false;
			for(var j in alphabet2){
				if(i === j){
					match = true;
					break;
				}
			}

			if(!match){
				return false;
			}
		}

		return true;
	}
}

/**
 * Converts an array of process objects into a mapping from the object's id
 * to the object.
 *
 * @param {object[]} objects - an array of objects
 * @param {string -> object} - an object map from id to object
 */
function convertArrayToMap(objects){
	var objectMap = {};
	for(var i = 0; i < objects.length; i++){
		objectMap[objects[i].id] = objects[i];
	}

	return objectMap;
}