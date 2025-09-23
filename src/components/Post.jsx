import React from "react";

export function Post({ postProps }) {
  return (
    <li className="col-xs-12 post-it">
      <div>
        <h2>{postProps.titulo}</h2>
        <p>{postProps.descripcion}</p>
      </div>
    </li>
  );
}
