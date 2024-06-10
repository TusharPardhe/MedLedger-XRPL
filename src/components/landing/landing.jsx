import './landing.scss';

import { Box, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from 'react';

import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';

const SpinningBox = ({ rotationSpeed, initialRotation }) => {
    const mesh = useRef(null);
    useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += rotationSpeed));

    // Set initial rotation
    useEffect(() => {
        if (mesh.current) {
            mesh.current.rotation.x = initialRotation;
            mesh.current.rotation.y = initialRotation;
        }
    }, [initialRotation]);

    return (
        <Box args={[2.25, 2.25, 2.25]} ref={mesh}>
            <meshStandardMaterial attach="material" color="lightblue" />
        </Box>
    );
};

SpinningBox.propTypes = {
    rotationSpeed: PropTypes.Number,
    initialRotation: PropTypes.Number,
};

const Landing = () => {
    const rotationSpeeds = [0.002, 0.004, 0.006];
    const initialRotations = [0, Math.PI / 2, Math.PI]; // 0, 90, and 180 degrees

    return (
        <div className="landing-page">
            <div className="left-section">
                <h1>Welcome to MedLedger</h1>
                <div className="button-group">
                    <Link to="/login" className="button">
                        Login
                    </Link>
                    <Link to="/registration" className="button">
                        Register
                    </Link>
                </div>
            </div>
            <div className="right-section">
                <Canvas style={{ height: '100%', width: '100%' }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} />
                    {rotationSpeeds.map((rotationSpeed, i) => (
                        <SpinningBox key={i} rotationSpeed={rotationSpeed} initialRotation={initialRotations[i]} />
                    ))}
                    <OrbitControls enableZoom={false} />
                </Canvas>
            </div>
        </div>
    );
};

export default Landing;
