import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./Header.css";
const Header = () => {
  return (
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">
          Bucket
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/">
                Home
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="/bucket">
                Get Bucket
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/login">
                Sign in
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/profile">
                Profile
              </a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                More
              </a>

              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="/register">
                    Resgister Yourself
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="/about">
                    About us
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="/contact">
                    Contact us
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
