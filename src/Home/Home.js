function Home() {
  return (
    <>
      <nav class="navbar  navbar-fixed-top navbar-inverse">
        <div class="container">
          <button
            type="button"
            class="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#navbar-collapse"
            aria-expanded="false"
          >
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbar-collapse">
            <ul class="nav navbar-nav ">
              <li>
                <a href="/sun" title="">
                  01 : Home
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div class="hero-full-container background-image-container white-text-container"></div>
    </>
  );
}

export default Home;
