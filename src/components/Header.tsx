import React from 'react';

const Header: React.FC = () => {
    return (
        <header style={styles.header}>
            <h1 style={styles.title}>EViator</h1>
            <nav style={styles.nav}>
                <a href="#home" style={styles.link}>Home</a>
                <a href="#about" style={styles.link}>About</a>
                <a href="#contact" style={styles.link}>Contact</a>
            </nav>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#282c34',
        color: 'white',
    },
    title: {
        fontSize: '1.5rem',
    },
    nav: {
        display: 'flex',
        gap: '15px',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
    },
};

export default Header;