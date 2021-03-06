"use strict";

/**
 * The results from the last compilation.
 */
var lastTokens = [];
var lastAst = {};
var lastAnalysis = {};
var lastProcesses = [];
var lastGraphs = [];
var lastAbstraction = true;

/**
 * Runs the compilation process for the model checker. This process is broken
 * down into the following steps:
 *
 * 1. Lexing
 *		- Takes the specified code and constructs an array of tokens
 * 2. Parsing
 *		- Parses the tokens to form an abstract syntax tree
 * 3. Expanding
 *    - Expands shorthand syntax used in the abstract syntax tree to be represented 
 *      as longhand syntax
 * 4. Analysis
 *		- Determines what processes need to be re-interpreted and eliminates
 *		  redundant code
 * 5. Interpeting
 *		- Interprets the abstract syntax tree into data structures representing
 *		  the processes that are being modelled
 * 6. Graph Construction
 *		- Converts the data structures into a graph structure defined by dagre
 *		  which can be rendered by dagreD3
 *
 * @param {string} code - code to be processed
 * @throws {exception} - throws an exception specific to the stage where the error
 *						 took place
 */
function compile(code, isFairAbstraction){
	try{
		// convert code into an array of tokens
		var tokens = lexer.parse(code); // lexer.parse function in 'lexer.js'
		
		// convert code into an abstract syntax tree of the defined processes  
		var ast = parse(tokens); // parse function in 'parser.js'
		
		// expand out indexed processes within the abstract syntax tree
		ast = expand(ast); // expand function defined in 'expander.js'

		// perform analysis to see which processes need to be re-interpreted
		var abstractionChanged = isFairAbstraction !== lastAbstraction;
		var analysis = performAnalysis(ast.processes, lastAnalysis, abstractionChanged); // performAnalysis function in 'analyser.js'
		
		// convert the processes from the ast into their appropriate data structures
		var processes = interpret(ast.processes, ast.variableMap, analysis, lastProcesses, isFairAbstraction); // interpret function in 'interpreter.js'
		
		var operations = evaluateOperations(ast.operations, processes, ast.variableMap);

		// convert the process data structures into dagre graphs that can
		// be rendered by dagreD3
		var graphs = constructGraphs(processes, analysis, lastGraphs); // construct graph function in 'graphConstructor.js'

		// store results of this compilation
		lastTokens = tokens;
		lastAst = ast;
		lastAnalysis = analysis;
		lastProcesses = processes;
		lastGraphs = graphs;
		lastAbstraction = isFairAbstraction;

		return {graphs:graphs, operations:operations };
	}catch(error){
		error.type = 'error';
		return error;
	}
}