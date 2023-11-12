import React, { useEffect } from "react";

// Put route checking logic here, if we need it!

export default ComposedComponent => (props) => {
  logger.logRoute({ match: props.match });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlEl = document.querySelector('html');
      htmlEl.scrollTop = 0;
    }
  })

  return <ComposedComponent {...props} />
}