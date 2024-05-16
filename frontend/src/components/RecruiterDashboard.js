import React from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const RecruiterDashboard = () => {
    return (
        <Container className="mt-5">
            <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>
            <Row>
                <Col md={6}>
                    <Card className="shadow p-4">
                        <h5 className="mb-4">Añadir Candidato</h5>
                        <Link to="/add-candidate">
                            <Button variant="primary" className="btn-block">Añadir Nuevo Candidato</Button>
                        </Link>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RecruiterDashboard;