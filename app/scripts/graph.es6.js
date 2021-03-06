class Graph{

  constructor(id, rootId, nodeMap, nodeCount, edgeMap, edgeCount){
    this._id = id;
    this._rootId = (rootId !== undefined) ? rootId : undefined;
    this._nodeMap = (nodeMap !== undefined) ? nodeMap : {};
    this._nodeCount = (nodeCount !== undefined) ? nodeCount : 0;
    this._edgeMap = (edgeMap !== undefined) ? edgeMap : {};
    this._edgeCount = (edgeCount !== undefined) ? edgeCount : 0;
    this._nextNodeId = 0;
    this._nextEdgeId = 0;
  }

  /**
   * Returns the fact that this data structure represents
   * an automaton.
   *
   * @return {string} - automata
   */
  get type(){
    return 'automata';
  }

  /**
   * Returns the unique identifier for this graph.
   *
   * @return {int} - graph id
   */
  get id(){
    return this._id;
  }

  /**
   * Returns the root node for this graph.
   *
   * @return {node} - the root
   */
  get root(){
    return this._nodeMap[this._rootId];
  }

  set root(node){
    if(node === this.root){
      return node;
    }
    
    for(let i in this._nodeMap){
      if(node === this._nodeMap[i]){
        this._rootId = node.id;
        return node;
      }
    }
    
    // node not in graph, throw error
  }

  /**
   * Returns an array of the terminal nodes in this automaton.
   *
   * @return {node[]} - an array of terminal nodes
   */
  get terminals(){
    var terminals = [];
    for(var id in this._nodeMap){
      if(this._nodeMap[id].getMetaData('isTerminal') !== undefined){
        terminals.push(this._nodeMap[id]);
      }
    }

    return terminals;
  }

  /**
   * Returns the unique identifier for the root node of this graph.
   *
   * @return {int} - root id
   */
  get rootId(){
    return this._rootId;
  }
  
  /**
   * Sets the root's id for this graph to the specified id.
   *
   * @param {int} id - the new root id
   * @param {int} - the new root id
   */
  set rootId(id){
    if(this._nodeMap[id] !== undefined){
      this._rootId = id;
      return this._rootId;
    }

    // throw error: id is not a valid node id
  }

  /**
   * Returns an array of the nodes associated with this graph.
   * The root node is guarenteed to be the first node in the
   * the array.
   *
   * @return {node[]} - an array of nodes
   */
  get nodes(){
    var nodes = [this._nodeMap[this._rootId]];
    for(var i in this._nodeMap){
      if(i !== this._rootId){
        nodes.push(this._nodeMap[i]);
      }
    }

    return nodes;
  }

  /**
   * Returns the node specified by the given unique identifier.
   *
   * @param {int} id - the node id
   * @return {node} - node with the given id
   */
  getNode(id){
    if(this._nodeMap[id] !== undefined){
      return this._nodeMap[id];
    }

    // throw error: not valid id
  }

  /**
   * Constructs and adds a new node to this graph. Returns the
   * constructed node.
   *
   * @param {int} id - unqiue identifier for the new node
   * @param {string} label - the label for the new node
   * @param {map} metaData - meta data for new node
   * @return {node} - the new node
   */
  addNode(id, label, metaData){
    // determine if paramaters have been defined
    id = (id === undefined) ? this.nextNodeId : id;
    label = (label === undefined) ? '' : label;
    metaData = (metaData === undefined) ? {} : metaData;
    let node = new Graph.Node(id, label, metaData);
    this._nodeMap[id] = node;
    this._nodeCount++;
    return node;
  }

  removeNode(id){
    var node = this._nodeMap[id];
    // remove edges that reference this node
    var edges = node.edgesToMe.concat(node.edgesFromMe);
    for(var i = 0; i < edges.length; i++){
      this.removeEdge(edges[i].id);
    }

    delete this._nodeMap[id];
    this._nodeCount--;
  }

  /**
   * Returns the number of nodes currently in this graph.
   *
   * @return {int} - node count
   */
  get nodeCount(){
    return this._nodeCount;
  }

  /**
   * Returns the next unique identifier for a node.
   *
   * @return {string} - next node id
   */
  get nextNodeId(){
    return this._id + '.' + this._nextNodeId++;
  }

  /**
   * Returns an array of the edges in this graph.
   *
   * @return {edge[]} - an array of edges
   */
  get edges(){
    let edges = [];
    for(let i in this._edgeMap){
      edges.push(this._edgeMap[i]);
    }

    return edges;
  }

  /**
   * Constructs and adds a new edge to this graph with the specified
   * label and the node ids that the new edge transitions to and from.
   * Returns the new edge.
   *
   * @param {int} id - the id for the new edge
   * @param {string} label - the action label the new edge represents
   * @param {int} from - the id of the node the new edge transitions from
   * @param {int} to - the id of the node the new edge transitions to
   * @return {edge} - the new edge
   */
  addEdge(id, label, from, to){
    // check that ids recieved are valid
    if(this._nodeMap[from] === undefined){
      // throw error: from not defined
    }
    if(this._nodeMap[to] === undefined){
      // throw error: to not defined
    }

    let edge = new Graph.Edge(id, label, from, to);
    this._nodeMap[from].addEdgeFromMe(edge);
    this._nodeMap[to].addEdgeToMe(edge);
    this._edgeMap[id] = edge;
    this._edgeCount++;
    return edge;
  }

  /**
   * Returns the number of edges currently in this graph.
   *
   * @return {int} - edge count
   */
  get edgeCount(){
    return this._edgeCount;
  }
  
  /**
   * Returns the next unique identifier for an edge.
   *
   * @return {string} - next edge id
   */
  get nextEdgeId(){
    return this._id + '.' + this._nextEdgeId++;
  }

  /**
   * Relabels the edges in this automaton with the specified label
   * with the specified new label.
   *
   * @param {string} oldLabel - the old label
   * @param {string} newLabel - the new label
   */
  relabelEdge(oldLabel, newLabel){
    var edges = this.edges;
    for(var i = 0; i  < edges.length; i++){
      if(edges[i].label === oldLabel){
        edges[i].label = newLabel;
      }
    }
  }

  /**
   * Removes the specified edge from this automaton.
   *
   * @param {string} id - the id of the edge to remove
   */
  removeEdge(id){
    delete this._edgeMap[id];
    this._edgeCount--;
  }

  /**
   * Relabels all the edges in this automaton with the specified
   * label.
   *
   * @param {string} label - the new label
   */
  labelEdges(label){
    var edges = this.edges;
    for(var i = 0; i < edges.length; i++){
      edges[i].label = label + '.' + edges[i].label;
    }
  }

  /**
   * Returns the alphabet of actions that are associated with this
   * automaton.
   *
   * @ return{string{}} - a set of actions
   */
  get alphabet(){
    var alphabet = {};
    var edges = this.edges;
    for(var i = 0; i < edges.length; i++){
      alphabet[edges[i].label] = true;
    }

    return alphabet;
  }

  /**
   * Merges the nodes in the specified array into a single node.
   * The first element of the array is the place which the remaining
   * elements will be merged with.
   *
   * @param {node[]} - an array of nodes
   */
  mergeNodes(nodes){
    var node = nodes[0];

    // merge remaining nodes to this to node
    for (var i = 1; i < nodes.length; i++) {
      var current = nodes[i];

      var edges = current.edgesFromMe;
      for (var j = 0; j < edges.length; j++) {
        edges[j].from = node.id;
        node.addEdgeFromMe(edges[j]);
      }

      edges = current.edgesToMe;
      for (var _j = 0; _j < edges.length; _j++) {
        edges[_j].to = node.id;
        node.addEdgeToMe(edges[_j]);
      }

      // check if the current node is either a start node or terminal
      if (current.getMetaData('startNode')) {
        node.addMetaData('startNode', true);
        this.rootId = node.id;
      }

      var terminal = current.getMetaData('isTerminal');
      if (terminal !== undefined) {
        node.addMetaData('isTerminal', terminal);
      }

      delete this._nodeMap[current.id];
      this._nodeCount--;
    }
  }
  
  /**
   * Adds the specified graph to this graph. Merges the root node of the specified
   * graph with the given node from this graph.
   *
   * @param {graph} graph - the graph to add
   * @param {node} node - the node to merge on
   */
  addGraph(graph, node){
    let rootId;
    // add nodes to this graph
    let nodes = graph.nodes;
    for(let i = 0; i < nodes.length; i++){
      let n = this.addNode(this.nextNodeId, nodes[i].label, nodes[i].cloneMetaData);
      
      // update root on first pass through the loop
      if(i === 0){
        rootId = n.id;
      }

      // updated references for the current node
      let edges = nodes[i].edgesFromMe;
      for(let j = 0; j < edges.length; j++){
        edges[j].from = n.id;
      }
      
      edges = nodes[i].edgesToMe;
      for(let j = 0; j < edges.length; j++){
        edges[j].to = n.id;
      }
    }
    
    // add edges to this graph
    let edges = graph.edges;
    for(let i = 0; i < edges.length; i++){
      this.addEdge(this.nextEdgeId, edges[i].label, edges[i].from, edges[i].to);
    }
    
    // merge on specified node
    this.mergeNodes([node, this._nodeMap[rootId]]);
  }

  /**
   * Returns a clone of this graph.
   *
   * @return {graph} - clone of graph
   */
  get clone(){
    let clone = new Graph();

    // add nodes to clone
    let nodes = this.nodes;
    for(let i = 0; i < nodes.length; i++){
      clone.addNode(nodes[i].id, nodes[i].label, nodes[i].cloneMetaData);
    }

    // add edges to clone
    let edges = this.edges;
    for(let i = 0; i < edges.length; i++){
      clone.addEdge(edges[i].id, edges[i].label, edges[i].from, edges[i].to);

      // add edges to the nodes they transition between
      this.getNode(edges[i].from).addEdgeFromMe(edges[i]);
      this.getNode(edges[i].to).addEdgeToMe(edges[i]);
    }

    clone.rootId = this._rootId;
    clone._nextNodeId = clone.nodeCount;
    clone._nextEdgeId = clone.edgeCount;

    return clone;
  }

  /**
   * Removes all the unreachable components of this automaton.
   */
  trim(){
    var visited = {};
    var fringe = [this.root];
    while(fringe.length !== 0){
      var current = fringe.pop();
      // chcek if the current node has already been visited
      if(visited[current.id] === undefined){
        // push neighbours to fringe
        var neighbours = current.neighbours;
        for(var i = 0; i < neighbours.length; i++){
          fringe.push(this._nodeMap[neighbours[i]]);
        }

        // mark current node as visited
        visited[current.id] = true;
      }
    }

    // build up a list of nodes to delete
    var toDelete = [];
    for(var id in this._nodeMap){
      if(visited[id] === undefined){
        toDelete.push(this._nodeMap[id]);
      }
    }

    // delete unvisited nodes
    for(var i = 0; i < toDelete.length; i++){
      // get edges from the current node
      var edges = toDelete[i].edgesFromMe;
      delete this._nodeMap[toDelete[i].id];
      this._nodeCount--;
      for(var j = 0; j < edges.length; j++){
        delete this._edgeMap[edges[j].id];
        this._edgeCount--;
      }
    }
  }

  /**
   * Removes all the duplicate edges from this automaton
   */
  removeDuplicateEdges(){
    var toDelete = [];
    var edges = this.edges;
    for(var i = 0; i < edges.length; i++){
      for(var j = i + 1; j < edges.length; j++){
        if(edges[i].from !== edges[j].from){
          continue;
        }

        if(edges[i].to !== edges[j].to){
          continue;
        }

        if(edges[i].label !== edges[j].label){
          continue;
        }

        toDelete.push(edges[j].id);
      }
    }

    // delete duplicate edges
    for(var i = 0; i < toDelete.length; i++){
      delete this._edgeMap[toDelete[i]];
      this._edgeCount--;
    }
  }
}

Graph.Node = class{

  constructor(id, label, metaData){
    this._id = id;
    this._label = label;
    this._edgesFromMe = {};
    this._edgesToMe = {};
    this._metaData = metaData;
  }

  /**
   * Returns the unique identifier for this node.
   *
   * @return {int} - node id
   */
  get id(){
    return this._id;
  }

  /**
   * Sets the unique identifier for this node
   *
   * @param {int} id - the new id
   * @return {int} - the new id
   */
  set id(id){
    this._id = id;
    return id;
  }

  /**
   * Returns the label of this node.
   *
   * @return {string} - label
   */
  get label(){
    return this._label;
  }

  /**
   * Sets the label of this node to the specified label.
   * Returns the new label.
   *
   * @param {string} label - the new label
   * @return {string} - the new label
   */
  set label(label){
    this._label = label;
    return this._label;
  }

  /**
   * Returns an array of edges that transition from this node.
   *
   * @return {edge[]} - array of edges
   */
  get edgesFromMe(){
    var edges = [];
    for(let i in this._edgesFromMe){
      edges.push(this._edgesFromMe[i]);
    }

    return edges;
  }

  /**
   * Adds the specified edge to the map of edges that
   * transitions from this node.
   *
   * @param {edge} edge - the edge to add
   */
  addEdgeFromMe(edge){
    this._edgesFromMe[edge.id] = edge;
  }

  /**
   * Deletes the reference to the specified outgoing edge
   * from this node.
   *
   * @param {edge} edge - the edge to delete
   */
  deleteEdgeFromMe(edge){
    delete this._edgesFromMe[edge.id];
  }

  /**
   * Returns an array of edges that transition to this node.
   *
   * @return {edge[]} - array of edges
   */
  get edgesToMe(){
    var edges = [];
    for(let i in this._edgesToMe){
      edges.push(this._edgesToMe[i]);
    }

    return edges;
  }

  /**
   * Adds the specified edge to the map of edges that
   * transition to this node.
   *
   * @param {edge} edge - the edge to add
   */
  addEdgeToMe(edge){
    this._edgesToMe[edge.id] = edge;
  }

  /**
   * Deletes the reference to the specified incoming edge from
   * this node.
   *
   * @param {edge} edge - the edge to delete
   */
  deleteEdgeToMe(edge){
    delete this._edgesToMe[edge.id];
  }

  /**
   * Returns an array of neighbouring nodes to this node.
   * A neighbouring node is a node which is transitionable
   * to from this node.
   *
   * @return {node[]} - array of nodes
   */
  get neighbours(){
    let neighbours = []
    for(let i in this._edgesFromMe){
      neighbours.push(this._edgesFromMe[i].to);
    }

    return neighbours;
  }

  /**
   * Returns true if this node is accessible, otherwise returns
   * false. A node is considered accessible when there are edges
   * transitioning to that node.
   *
   * @return {boolean} - whether this node is accessible or not
   */
  get isAccessible(){
    return this._edgesToMe.length === 0;
  }

  /**
   * Returns the nodes ids that this node can transition to via the
   * specified action.
   *
   * @param {string} action - the action to check for
   * @return {int[]} - an array of node ids 
   */
  coaccessible(action){
    var nodes = [];
    for(var i in this._edgesFromMe){
      if(this._edgesFromMe[i].label === action){
        nodes.push(this._edgesFromMe[i].to);
      }
    }

    return nodes;
  }

  /**
   * Returns true if this node is unreachable, otherwise returns false.
   *
   * @return {boolean} - whether or not this node is unreachable
   */
  get isUnreachable(){
    for(var id in this._edgesToMe){
      // if there is an edge to this node, which means it is reachable
      return false;
    }

    // if it reaches this point there are no edges to this node
    return true;
  }

  /**
   * Returns true if this node has no edges from it, otherwise returns false.
   * Note this is not related to the 'isTerminal' value in the meta data for
   * this node.
   *
   * @return {boolean} - whether or not this node is terminal
   */
  get isTerminal(){
    for(var id in this._edgesFromMe){
      // if there are edges from this node it is not a terminal
      return false;
    }

    // if it reaches this point there are no edges from this node
    return true;
  }

  /**
   * Returns the meta data object associated with this node.
   *
   * @return {object} - meta data
   */
  get metaData(){
    return this._metaData;
  }

  /**
   * Sets the meta data object of this node to the specified
   * meta data.
   *
   * @param {object} metaData - the new meta data object
   * @return {object} - the new metaData object
   */
  set metaData(metaData){
    this._metaData = metaData;
    return metaData;
  }

  /**
   * Adds the specified key-value pair to the meta data
   * associated with this node.
   *
   * @param {string} key - the data key
   * @param {var} value - the value to add
   */
  addMetaData(key, value){
    this._metaData[key] = value;
  }

  /**
   * Returns the value associated with the specified key.
   * returns undefined if the key is not present in the
   * meta data for this node.
   *
   * @param {string} key - the data key
   * @return {var} - the value associated with the key
   */
  getMetaData(key){
    return this._metaData[key];
  }

  /**
   * Deletes the entry in the meta data for the specified key.
   *
   * @param {string} key - the data key
   */
  deleteMetaData(key){
    delete this._metaData[key];
  }

  /**
   * Returns a clone of the meta data associated with this node.
   *
   * @return {object} - cloned meta data
   */
  get cloneMetaData(){
    return JSON.parse(JSON.stringify(this._metaData));
  }
}

Graph.Edge = class{

  constructor(id, label, from, to){
    this._id = id;
    this._label = label;
    this._from = from;
    this._to = to;
  }

  /**
   * Returns the unique identifier for this edge.
   *
   * @return {int} - edge id
   */
  get id(){
    return this._id;
  }
  
  /**
   * Sets the unique identifier for this edge to the specified
   * id.
   *
   * @param {int} id - the new id
   * @return {int} - the new id
   */
  set id(id){
    this._id = id;
    return this._id;
  }
  
  /**
   * Returns the action label associated with this edge.
   *
   * @return {string} - label
   */
  get label(){
    return this._label;
  }

  /**
   * Sets the action label of this edge to the specified
   * label.
   *
   * @param {string} label - the new label
   * @return {string} - the new label
   */
  set label(label){
    this._label = label;
    return this._label;
  }

  /**
   * Returns the unique identifier for the node that this
   * edge transitions from.
   *
   * @return {int} - node id
   */
  get from(){
    return this._from;
  }

  /**
   * Sets the unique identifier for the node that this edge
   * transitions from to the specified id.
   *
   * @param {int} id - the new id
   * @return {int} - the new id
   */
  set from(id){
    this._from = id;
    return this._from;
  }

  /**
   * Returns the unique identifier for the node that this
   * edge transitions to.
   *
   * @return {int} - node id
   */
  get to(){
    return this._to;
  }

  /**
   * Sets the unique identifier for the node that this edge
   * transitions to to the specified id.
   *
   * @param {int} id - the new id
   * @return {int} - the new id
   */
  set to(id){
    this._to = id;
    return this._to;
  }
}