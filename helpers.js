function getChildNodes(child) {
    if (child.members)  {
        return child.members;;
    } else if (child.body && child.body.statements) {
        return child.body.statements;
    } else if (child.body && !child.body.statements) {
        return [];
    }
  }

  exports.getChildNodes = getChildNodes;