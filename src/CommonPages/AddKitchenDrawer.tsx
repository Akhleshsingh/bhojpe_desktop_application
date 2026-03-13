import React from "react";
import { Offcanvas, Form, Button } from "react-bootstrap";

type Props = {
  show: boolean;
  onClose: () => void;
};

export default function AddKitchenDrawer({ show, onClose }: Props) {
  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop
      style={{ width: 420 }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Kitchens</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Form>
          {/* Kitchen Name */}
          <Form.Group className="mb-3">
            <Form.Label>
              Kitchen Name <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control placeholder="Enter Kitchen Name" />
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter Kitchen Description"
            />
          </Form.Group>

          {/* Printer */}
          <Form.Group className="mb-4">
            <Form.Label>
              Select Printer <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select>
              <option>
                Default Thermal Printer - browserPopupPrint
              </option>
              <option>Kitchen Printer 1</option>
              <option>Kitchen Printer 2</option>
            </Form.Select>
          </Form.Group>

          {/* SAVE */}
          <div className="d-flex justify-content-end">
            <Button
              style={{
                backgroundColor: "#BA3131",
                border: "none",
                padding: "6px 18px",
              }}
            >
              Save
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
